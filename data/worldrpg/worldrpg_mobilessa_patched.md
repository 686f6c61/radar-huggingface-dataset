# WorldRPG/worldrpg_mobilessa_patched

## Resumen

`WorldRPG/worldrpg_mobilessa_patched` no es un modelo de inteligencia artificial: es un repositorio de artefactos binarios (un APK de Android y sus librerías nativas parcheadas) publicado en Hugging Face bajo el identificador de WorldRPG. Concretamente, contiene el cliente **MTA:SA mobile** del proyecto WorldRPG, basado en el APK oficial **MobileSA 2.10** (`com.mobilesa.game`), al que se le han aplicado parches binarios para neutralizar el anti-tamper y permitir la conexión al servidor privado `worldrpgbroficial.duckdns.org:22003` (MTA Neon 1.7.0).

El problema que resuelve es de compatibilidad: el APK original rechaza ejecutarse tras ser re-firmado y no habla el mismo protocolo de red que el servidor 1.7.0. Los parches actúan en cinco capas (Java, dos librerías nativas, código Dart AOT y un snapshot de Dart) y se complementan con un adaptador *server-side* (`libpacketlogger.so`) que ajusta el wire protocol móvil. El repositorio ocupa 0,2 GB y no incluye pesos, tokenizador, configuración de transformer ni pipeline de inferencia.

Por tanto, esta ficha documenta un artefacto de ingeniería inversa y distribución de software, no un modelo lingüístico. No hay arquitectura de red neuronal, parámetros, contexto, cuantización ni benchmarks que reportar; los apartados técnicos se completan con la información disponible sobre el APK, sus parches y su validación en dispositivo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un APK Android con librerías nativas parcheadas) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | portugués (pt) según metadatos del repo; la UI del launcher y el servidor son en portugués |
| Licencia | other (uso restringido; incluye binarios de terceros de MobileSA / War Drum Studios / Rockstar Games; no es software libre y no puede redistribuirse fuera del proyecto) |
| Formato de pesos | no disponible (no hay pesos; el repo contiene `.apk`, `.so` y documentación Markdown) |
| Tamano del repositorio | 0,2 GB |
| Plataforma objetivo | Android 7.0+ (minSdk 24), solo `arm64-v8a` (no arranca en `armeabi-v7a` ni `x86`) |
| Paquete base | MobileSA 2.10 (`com.mobilesa.game`) |
| Servidor de destino | `worldrpgbroficial.duckdns.org:22003` (MTA:SA 1.7.0 Neon) |
| Launcher incluido | `com.worldrpg.launcher.WorldRPGLauncher` (nativo, sustituye la pantalla Flutter) |
| Fecha de validación | 2026-11-09, en Samsung S25 (arm64-v8a) |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de modelo. El artefacto es un APK de Android con un launcher nativo propio y un conjunto de parches binarios sobre cinco componentes: (1) código Java ofuscado (`pw.d`), donde se desvía el flujo con `goto/16` hacia `Low;->f` (que devuelve OK) preservando `pw.a` para el registro del contexto que el motor necesita; (2) `libMobileSA.so`, con cuatro offsets modificados (`0xfcbae0`, `0xfcc6b4`, `0xfcff28`, `0xfd0254`) que fijan un flag, retornan `true` y eliminan comprobaciones condicionales (`cbz` → `nop`); (3) `libMobileSA_Net.so`, con dos offsets (`0x1feef8`, `0x202de8`) de la misma naturaleza; (4) `libapp.so` (Dart AOT), con dos `nop` en `0x2433c` y `0x25030`; y (5) `libMobileSA_LauncherData.so`, un snapshot de Dart con 171 regiones modificadas (configuración y cadenas de la UI).

El launcher propio sustituye la pantalla Flutter por una interfaz de pantalla única con logo, banner, campo de nickname y botón JUGAR. En la primera ejecución descarga `game_files_android_mta` (264 archivos, 753 MB) desde un CDN con verificación SHA-256 y reanudación, y los escribe en `/storage/emulated/0/Android/data/com.mobilesa.game/files/`, que es la ruta que lee el motor. En el lado servidor, el adaptador `libpacketlogger.so` (cargado vía `LD_PRELOAD`) autentica al cliente móvil (`player+2114 = 1`, sin lo cual se produce el error CD09), adapta `RESOURCE_START` eliminando el MD5 de 128 bits de los chunks `F`, corrige el orden de bits LSB-first del wire protocol y elimina `callPropagation`/`syncTimeContext` del `ENTITY_ADD` para el bitstream `0x030`.

## Capacidades

- Ejecutar el cliente MTA:SA mobile parcheado en Android `arm64-v8a` sin que salte el anti-tamper de tres capas.
- Conectar directamente al servidor WorldRPG (`worldrpgbroficial.duckdns.org:22003`) sin pasar por el *server browser*.
- Descargar y verificar los 753 MB de recursos del juego (264 archivos) desde CDN con SHA-256 y reanudación de descargas.
- Interfaz de launcher con campo de nickname y botón de conexión.
- Juego en sí validado en dispositivo real: `state=kInGame`, jugador *spawned*, sincronización activa, HUD completo (reloj, vida, colete, dinero, radar) y controles táctiles (puño, carrera, natación).
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Distribución del cliente a jugadores del servidor WorldRPG: el repositorio actúa como punto oficial de descarga del APK parcheado, con instrucciones de instalación vía `adb install` o instalación manual permitiendo fuentes desconocidas.
- Pruebas de compatibilidad de netcode entre cliente mobile y servidor MTA 1.7.0: el adaptador `libpacketlogger.so` y los diagnósticos (`docs/DIAGNOSTICO_NETCODE_1_7.md`) permiten reproducir y depurar diferencias de epoch de netcode (0x41E7 frente a 1.6).
- Ingeniería inversa y auditoría de anti-tamper: `patches/PATCHES_DESCOBERTOS.md` documenta offsets y bytes concretos, útil para estudiar mecanismos de protección en apps Android de terceros.
- Investigación de wire protocol móvil: `scripts/packetlogger.cpp` sirve como referencia de adaptación server-side del protocolo de red móvil.
- Entornos de servidor privado con clientes heterogéneos: el parcheo permite que dispositivos Android modernos se conecten a un servidor que de otro modo rechazaría al cliente re-firmado.
- Formación interna del equipo WorldRPG: la documentación de causa raíz (`docs/CAUSA_RAIZ_SERVIDOR_BINARIO.md`) explica por qué era necesario modificar el binario del servidor, útil para futuras actualizaciones de versión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no reporta métricas de latencia, throughput ni calidad; únicamente un estado de validación funcional en Samsung S25 (arm64-v8a) con fecha 2026-11-09: instalación y arranque sin anti-tamper, descarga de 753 MB desde CDN, conexión al servidor, `state=kInGame`, HUD completo y controles táctiles operativos. Se señala un problema abierto: las interfaces de recurso `0xB5`/`0xC2` presentan un *drift* de 17 bits, en corrección.

## Requisitos de hardware

- Dispositivo Android 7.0+ (minSdk 24) con CPU `arm64-v8a`; no funciona en `armeabi-v7a` ni `x86` (incluye emuladores x86 habituales).
- Espacio libre: 0,2 GB del repositorio más 753 MB de recursos del juego descargados en la primera ejecución (aproximadamente 1 GB en total).
- Memoria y GPU: no disponible en la información proporcionada; el APK base es MobileSA 2.10 y hereda sus requisitos, no documentados en el repo.
- Despliegue: instalación vía `adb install WorldRPG-MobileSA-patched.apk` o instalación manual del APK.
- Lado servidor: MTA Neon 1.7.0 con `libpacketlogger.so` cargado mediante `LD_PRELOAD`; sin él, el cliente móvil no autentica (error CD09).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo; los elementos potencialmente comparables serían otros clientes MTA:SA mobile parcheados o el APK oficial de fábrica (`MobileSA-release-216c1e7f.apk`, 88 MB), que se incluye en el propio repositorio como referencia intacta y que, a diferencia del parcheado, rechaza ejecutarse re-firmado y no conecta al servidor WorldRPG 1.7.0.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal; carece de pesos, tokenizador, pipeline y API de inferencia.
- Licencia `other` con uso restringido: contiene binarios de terceros (MobileSA / War Drum Studios / Rockstar Games) y no puede redistribuirse fuera del proyecto WorldRPG; no es software libre.
- Riesgo legal: la modificación y redistribución de binarios de GTA: San Andreas y MobileSA puede contravenir sus términos de uso; el autor lo limita a un servidor privado y a pruebas.
- Solo `arm64-v8a`: excluye dispositivos antiguos de 32 bits y emuladores x86, lo que reduce la base de usuarios compatibles.
- Bug abierto: *drift* de 17 bits en las interfaces de recurso `0xB5`/`0xC2`, que puede afectar a funcionalidades del servidor que dependan de esas interfaces.
- Dependencia estricta del servidor: requiere MTA Neon 1.7.0 con `libpacketlogger.so`; contra otros servidores o versiones el cliente no funcionará correctamente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin proceso de revisión comunitario.
- Fecha de creación y actualización (2026-11-09) posterior a la fecha habitual de referencia; verificar vigencia antes de su uso en producción.
- Sin garantías de mantenimiento: los parches dependen de offsets concretos de una versión específica del APK; cualquier actualización de MobileSA los invalida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WorldRPG/worldrpg_mobilessa_patched
- Descarga directa del APK: https://huggingface.co/WorldRPG/worldrpg_mobilessa_patched/resolve/main/WorldRPG-MobileSA-patched.apk
- Servidor de destino: `worldrpgbroficial.duckdns.org:22003` (MTA:SA 1.7.0 Neon)
- Documentación de parches: `patches/PATCHES_DESCOBERTOS.md` (dentro del repositorio)
- Diagnóstico de netcode: `docs/DIAGNOSTICO_NETCODE_1_7.md` (dentro del repositorio)
- Causa raíz del servidor binario: `docs/CAUSA_RAIZ_SERVIDOR_BINARIO.md` (dentro del repositorio)
- Adaptador server-side: `scripts/packetlogger.cpp` (dentro del repositorio)
- Papers, blogs o demos adicionales: no disponible
