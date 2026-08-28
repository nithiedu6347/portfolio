/**
 * Portfolio Icebreaker demo — LinkedIn URL parsing with client-side mock analysis.
 */
(function () {
    var OWNER_LINKEDIN = 'https://www.linkedin.com/in/nithiesh6347/';
    var CACHE_TTL_MS = 24 * 60 * 60 * 1000;
    var PROFILE_CACHE_PREFIX = 'ib_profile_v1_';
    var RESULT_CACHE_PREFIX = 'ib_portfolio_result_';

    var prospectInput = document.getElementById('ib-prospect-linkedin');
    var generateBtn = document.getElementById('ib-demo-generate');
    var clearBtn = document.getElementById('ib-demo-clear');
    var errorEl = document.getElementById('ib-demo-error');
    var resultsEl = document.getElementById('ib-demo-results');
    var cacheNoteEl = document.getElementById('ib-demo-cache-note');
    var prospectNameEl = document.getElementById('ib-prospect-name');
    var prospectRoleEl = document.getElementById('ib-prospect-role');
    var prospectAvatarEl = document.getElementById('ib-prospect-avatar');

    if (!prospectInput || !generateBtn) {
        return;
    }

    function s(val, fallback) {
        if (val === null || val === undefined) {
            return fallback || '';
        }
        if (typeof val === 'string') {
            return val;
        }
        if (typeof val === 'number' || typeof val === 'boolean') {
            return String(val);
        }
        return fallback || '';
    }

    function parseLinkedInUrl(url) {
        var trimmed = (url || '').trim();
        if (!trimmed) {
            return null;
        }
        try {
            var parsed = new URL(trimmed.indexOf('http') === 0 ? trimmed : 'https://' + trimmed);
            var match = parsed.pathname.match(/\/in\/([^/?#]+)/i);
            if (!match) {
                return null;
            }
            return parsed.origin + parsed.pathname.replace(/\/$/, '');
        } catch (_e) {
            return null;
        }
    }

    function getProfileCacheKey(url) {
        return PROFILE_CACHE_PREFIX + url.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    function loadCachedProfile(url) {
        try {
            var raw = localStorage.getItem(getProfileCacheKey(url));
            if (!raw) {
                return null;
            }
            var entry = JSON.parse(raw);
            if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
                localStorage.removeItem(getProfileCacheKey(url));
                return null;
            }
            return entry.profile;
        } catch (_e) {
            return null;
        }
    }

    function saveCachedProfile(url, profile) {
        try {
            localStorage.setItem(getProfileCacheKey(url), JSON.stringify({
                profile: profile,
                cachedAt: Date.now(),
                platform: 'linkedin',
            }));
        } catch (_e) {
            /* ignore quota errors */
        }
    }

    function getResultCacheKey(ownerUrl, prospectUrl) {
        return RESULT_CACHE_PREFIX + ownerUrl.toLowerCase() + '__' + prospectUrl.toLowerCase();
    }

    function loadCachedResult(ownerUrl, prospectUrl) {
        try {
            var raw = localStorage.getItem(getResultCacheKey(ownerUrl, prospectUrl));
            if (!raw) {
                return null;
            }
            var entry = JSON.parse(raw);
            if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
                localStorage.removeItem(getResultCacheKey(ownerUrl, prospectUrl));
                return null;
            }
            return entry.data;
        } catch (_e) {
            return null;
        }
    }

    function saveCachedResult(ownerUrl, prospectUrl, data) {
        try {
            localStorage.setItem(getResultCacheKey(ownerUrl, prospectUrl), JSON.stringify({
                timestamp: Date.now(),
                data: data,
            }));
        } catch (_e) {
            /* ignore */
        }
    }

    function extractPathSegments(url) {
        try {
            return new URL(url).pathname.replace(/\/$/, '').split('/').filter(Boolean);
        } catch (_e) {
            return [];
        }
    }

    function slugToDisplayName(slug) {
        return slug
            .replace(/[-_]+/g, ' ')
            .replace(/[0-9]/g, '')
            .trim()
            .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    function parseLinkedInSmart(url) {
        var cached = loadCachedProfile(url);
        if (cached) {
            return cached;
        }

        var parts = extractPathSegments(url);
        var username = '';
        if (parts.indexOf('in') >= 0) {
            username = parts[parts.indexOf('in') + 1] || '';
        }
        var cleanName = slugToDisplayName(decodeURIComponent(username));

        var profile = {
            name: cleanName || 'LinkedIn User',
            headline: cleanName ? (cleanName + ' — Professional') : 'Professional',
            bio: cleanName ? (cleanName + ' is active on LinkedIn') : 'Active on LinkedIn',
            image: '',
            location: 'India',
            company: 'Engineering / IT',
            skills: [],
            experiences: [],
            followersCount: 0,
            postsCount: 0,
            url: url,
            fetched: true,
        };

        saveCachedProfile(url, profile);
        return profile;
    }

    function mockAnalysis(profile) {
        var name = profile.name || 'Professional';
        var company = profile.company || 'their organization';
        return {
            name: name,
            profession: profile.headline || 'Professional',
            company: company,
            location: profile.location || 'India',
            education: 'Not available from URL',
            hobbies: ['Technology', 'Networking'],
            personalStrengths: ['Communication', 'Collaboration'],
            personalityTraits: ['Curious', 'Goal-oriented'],
            personalInterests: ['Professional growth', 'Industry trends'],
            keyStrengths: ['Problem solving', 'Teamwork'],
            professionalSummary: name + ' appears to be active in ' + company + ' with a focus on professional development.',
            recentActivity: 'Active on LinkedIn',
            platformsSummary: 'LinkedIn profile detected',
            icebreakerTopics: [
                'Ask about their current role at ' + company,
                'Discuss recent trends in their industry',
                'Share experiences from similar professional backgrounds',
            ],
            talkingPoints: [
                'Compare career paths in engineering and IT',
                'Discuss tools and workflows used in modern teams',
                'Explore mutual interests in technology and innovation',
            ],
            contentByPlatform: {
                linkedin: profile.bio || '',
                facebook: '',
                instagram: '',
            },
        };
    }

    function mockComparison(ownerAnalysis, prospectAnalysis) {
        var sharedLocation = ownerAnalysis.location === prospectAnalysis.location
            ? ownerAnalysis.location
            : 'India';
        var score = 65
            + (ownerAnalysis.company === prospectAnalysis.company ? 10 : 0)
            + (ownerAnalysis.location === prospectAnalysis.location ? 5 : 0);

        return {
            compatibilityScore: Math.min(score, 92),
            compatibilitySummary: ownerAnalysis.name + ' and ' + prospectAnalysis.name
                + ' share professional interests in technology and engineering. '
                + 'Both appear active in ' + sharedLocation + ', which gives natural conversation starters around industry trends and career growth.',
            commonInterests: ['Technology', 'Professional networking', 'Engineering / IT'],
            commonTraits: ['Curious', 'Goal-oriented'],
            commonHobbies: ['Learning', 'Networking'],
            techAndProfessional: ['Software development', 'Enterprise applications'],
            locationAndCulture: sharedLocation ? [sharedLocation] : [],
            mutualTalkingPoints: [
                'Discuss full-stack development experiences',
                'Compare approaches to digital transformation projects',
                'Share insights on cloud deployment and CI/CD practices',
                'Talk about AI-powered features in enterprise sales tools',
            ],
            icebreakerTopics: [
                'What drew you to your current role at ' + (prospectAnalysis.company || 'your company') + '?',
                'How do you stay updated with new tech in your field?',
                'Any interesting projects you are working on lately?',
            ],
        };
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }

    function hideError() {
        errorEl.classList.remove('visible');
        errorEl.textContent = '';
    }

    function setLoading(isLoading, label) {
        generateBtn.disabled = isLoading;
        if (isLoading) {
            generateBtn.innerHTML = '<span class="ib-demo-spinner"></span> ' + (label || 'Processing…');
        } else {
            generateBtn.innerHTML = '<span>✦</span> Generate Icebreaker Ideas';
        }
    }

    function renderChips(containerId, items, chipClass) {
        var el = document.getElementById(containerId);
        if (!el) {
            return;
        }
        if (!items.length) {
            el.innerHTML = '<span class="ib-demo-chip">None detected</span>';
            return;
        }
        el.innerHTML = items.map(function (item) {
            return '<span class="ib-demo-chip' + (chipClass ? ' ' + chipClass : '') + '">' + item + '</span>';
        }).join('');
    }

    function renderList(containerId, items) {
        var el = document.getElementById(containerId);
        if (!el) {
            return;
        }
        el.innerHTML = items.map(function (item) {
            return '<li>' + item + '</li>';
        }).join('');
    }

    function renderTalkingPoints(items) {
        var el = document.getElementById('ib-demo-talking-points');
        if (!el) {
            return;
        }
        el.innerHTML = items.map(function (item, i) {
            return (
                '<div class="ib-demo-talking-item">'
                + '<div class="ib-demo-talking-num">' + (i + 1) + '</div>'
                + '<div class="ib-demo-talking-text">' + item + '</div>'
                + '</div>'
            );
        }).join('');
    }

    function updateProspectPreview(analysis, profile) {
        var name = analysis.name || profile.name || 'Prospect';
        var role = analysis.profession || profile.headline || 'Professional';
        var company = analysis.company || profile.company || '';
        prospectNameEl.textContent = name;
        prospectRoleEl.textContent = company ? (role + ' · ' + company) : role;
        prospectAvatarEl.textContent = name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    }

    function renderResults(ownerAnalysis, prospectAnalysis, comparison, fromCache) {
        var score = comparison.compatibilityScore;
        var scoreColor = score >= 70 ? '#10b981' : score >= 55 ? '#f59e0b' : '#6366f1';
        var ring = document.getElementById('ib-demo-score-ring');
        var scoreText = document.getElementById('ib-demo-score-value');
        var summaryEl = document.getElementById('ib-demo-compat-summary');
        var compareNames = document.getElementById('ib-demo-compare-names');

        if (ring) {
            ring.style.setProperty('--score-color', scoreColor);
            ring.style.setProperty('--score-pct', Math.round(score * 3.6) + 'deg');
        }
        if (scoreText) {
            scoreText.textContent = String(score);
        }
        if (summaryEl) {
            summaryEl.textContent = comparison.compatibilitySummary;
        }
        if (compareNames) {
            compareNames.textContent = ownerAnalysis.name + ' ↔ ' + prospectAnalysis.name;
        }

        var interests = comparison.commonInterests
            .concat(comparison.techAndProfessional)
            .concat(comparison.locationAndCulture);
        var uniqueInterests = interests.filter(function (v, i, a) { return a.indexOf(v) === i; });

        renderChips('ib-demo-common-interests', uniqueInterests.slice(0, 8), '');
        renderChips('ib-demo-common-traits', comparison.commonTraits, 'pink');
        renderChips('ib-demo-common-hobbies', comparison.commonHobbies, 'teal');

        var topics = comparison.icebreakerTopics.length
            ? comparison.icebreakerTopics
            : prospectAnalysis.icebreakerTopics.slice(0, 5);
        renderList('ib-demo-topics', topics);

        var talking = comparison.mutualTalkingPoints.length
            ? comparison.mutualTalkingPoints
            : prospectAnalysis.talkingPoints.slice(0, 4);
        renderTalkingPoints(talking);

        resultsEl.classList.add('visible');
        cacheNoteEl.classList.toggle('visible', fromCache);
    }

    function delay(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    async function runAnalysis(useCache) {
        hideError();
        cacheNoteEl.classList.remove('visible');
        resultsEl.classList.remove('visible');

        var ownerUrl = parseLinkedInUrl(OWNER_LINKEDIN);
        var prospectUrl = parseLinkedInUrl(prospectInput.value);

        if (!prospectUrl) {
            showError('Enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/username).');
            return;
        }

        if (prospectUrl.toLowerCase() === ownerUrl.toLowerCase()) {
            showError('Enter a different LinkedIn profile — your profile is already Person 1.');
            return;
        }

        if (useCache) {
            var cached = loadCachedResult(ownerUrl, prospectUrl);
            if (cached) {
                updateProspectPreview(cached.prospectAnalysis, cached.prospectProfile);
                renderResults(cached.ownerAnalysis, cached.prospectAnalysis, cached.comparison, true);
                return;
            }
        }

        setLoading(true, 'Parsing LinkedIn profiles…');

        try {
            var ownerProfile = parseLinkedInSmart(ownerUrl);
            var prospectProfile = parseLinkedInSmart(prospectUrl);

            await delay(400);
            setLoading(true, 'Generating icebreaker ideas…');

            var ownerAnalysis = mockAnalysis(ownerProfile);
            var prospectAnalysis = mockAnalysis(prospectProfile);
            var comparison = mockComparison(ownerAnalysis, prospectAnalysis);

            var payload = {
                ownerProfile: ownerProfile,
                prospectProfile: prospectProfile,
                ownerAnalysis: ownerAnalysis,
                prospectAnalysis: prospectAnalysis,
                comparison: comparison,
            };

            saveCachedResult(ownerUrl, prospectUrl, payload);
            updateProspectPreview(prospectAnalysis, prospectProfile);
            renderResults(ownerAnalysis, prospectAnalysis, comparison, false);
        } catch (err) {
            showError(err.message || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    generateBtn.addEventListener('click', function () {
        runAnalysis(true);
    });

    clearBtn.addEventListener('click', function () {
        prospectInput.value = '';
        hideError();
        resultsEl.classList.remove('visible');
        cacheNoteEl.classList.remove('visible');
        prospectNameEl.textContent = 'Your Prospect';
        prospectRoleEl.textContent = 'Enter a LinkedIn URL below';
        prospectAvatarEl.textContent = '?';
    });

    prospectInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            runAnalysis(true);
        }
    });
})();
