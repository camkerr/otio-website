# Integration Assets TODO

This document tracks which integrations need logos and product screenshots/images.

## Status Summary

- ✅ **14 integrations** have logos (via Clearbit API or direct)
- ⚠️ **23 integrations** need logos (mostly open-source tools and GitHub projects)
- 🎯 **All integrations** could benefit from product screenshots

## Integrations with Logos ✅

1. **Adobe Premiere Pro** - Clearbit logo
2. **Altera** - Clearbit logo
3. **AVID Media Composer** - Clearbit logo
4. **Blender VSE IO** - Clearbit logo (Superprod)
5. **Cezanne Studio** - Direct logo + 3 screenshots ✨
6. **DaVinci Resolve** - Clearbit logo
7. **EditReader** - Clearbit logo
8. **ftrack cineSync Play** - Clearbit logo
9. **Hiero** - Clearbit logo (Foundry)
10. **Kdenlive** - Clearbit logo
11. **Matchbox** - Clearbit logo
12. **Nuke Studio** - Clearbit logo (Foundry)
13. **Olive** - Clearbit logo
14. **OpenRV** - Clearbit logo (ASWF)
15. **Raven** - Local logo + 1 screenshot ✨
16. **RV** - Clearbit logo (ShotGrid)
17. **Shot Manager** - Clearbit logo (Ubisoft)
18. **Video Tracks** - Clearbit logo (Ubisoft)

## Integrations Needing Logos ⚠️

### Open Source Projects (check GitHub repos for logos)

1. **hiero-otio** - https://github.com/apetrynet/hiero-otio/
2. **magla** - https://github.com/magnetic-lab/magla
3. **maya-otio** - https://github.com/rosborne132/maya-otio
4. **mrViewer** - https://mrviewer.sourceforge.io/ (could use SourceForge generic logo)
5. **otio-cdl-adapter** - https://github.com/josh-mission/otio-cdl-adapter
6. **otio-cookelensmetadata** - https://github.com/reinecke/otio-cookelensmetadata
7. **otio-drp-adapter** - https://pypi.org/project/otio-drp-adapter/
8. **otio-mlt-adapter** - https://pypi.org/project/otio-mlt-adapter/
9. **otio-premiereproject** - https://github.com/splidje/otio-premiereproject
10. **OpenTimelineIO Swift Bindings** - https://github.com/OpenTimelineIO/OpenTimelineIO-Swift-Bindings
11. **OpenTimelineIO Unreal Plugin** - https://github.com/OpenTimelineIO/OpenTimelineIO-Unreal-Plugin
12. **protio** - https://github.com/boredstiff/protio
13. **pype** - https://github.com/pypeclub/pype
14. **resolve-otio** - https://github.com/eric-with-a-c/resolve-otio
15. **sg-otio** - https://github.com/GPLgithub/sg-otio
16. **speech-edit** - https://github.com/ethan-ou/speech-edit
17. **tlRender** - https://github.com/darbyjohnston/tlRender
18. **toucan** - https://github.com/darbyjohnston/toucan
19. **UnrealOTIOExporter** - https://github.com/mvanneutigem/UnrealOtioExporter

## Where to Find Assets

### For Commercial Products:
- Check company press kits/media resources
- Look for "Brand Assets" or "Press" sections on official websites
- Contact companies directly for high-resolution assets

### For Open Source Projects:
- Check GitHub repository for:
  - `/docs` or `/assets` folders
  - Social preview images
  - README.md embedded images
  - Project icons in repository settings
- Check project websites if they have one
- Look for the project logo in:
  - Repository social preview (https://github.com/[owner]/[repo]/blob/main/social-preview.png)
  - Favicon or icon files
  - Documentation sites

### For Product Screenshots:
- Official product pages
- YouTube tutorials/demos
- Documentation sites
- GitHub README files
- Blog posts and announcements

## Recommended Actions

1. **High Priority** (major commercial products):
   - Adobe Premiere Pro - Get official product screenshots
   - DaVinci Resolve - Get official product screenshots
   - AVID Media Composer - Get official product screenshots
   - Nuke Studio - Get official product screenshots

2. **Medium Priority** (popular open-source):
   - OpenRV - Check ASWF GitHub for screenshots
   - Kdenlive - Check project website for screenshots
   - Olive - Check project website for screenshots
   - tlRender - Check GitHub for examples

3. **Low Priority** (adapters/libraries):
   - Most adapter/library tools don't need screenshots
   - Generic icons or code snippets are usually sufficient

## Notes

- Using Clearbit's logo API (logo.clearbit.com) which provides company logos based on domain
- Local logos should be placed in `/public/integrations/` with naming: `{integration-id}-logo.{ext}`
- Screenshots should be placed in `/public/integrations/` with naming: `{integration-id}-media-{n}.{ext}`
- Aim for 16:9 aspect ratio screenshots when possible
- PNG format preferred for screenshots, SVG or PNG for logos

