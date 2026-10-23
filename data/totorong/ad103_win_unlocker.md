# TOTORONG/AD103_win_unlocker

## Resumen

`TOTORONG/AD103_win_unlocker` no es un modelo de inteligencia artificial: es un repositorio de investigación publicado en Hugging Face por TOTORONG (Sungjin Park) que contiene una aplicación UEFI, código fuente compilable, herramientas de extracción de assets originales, un verificador de ROM, material de desensamblado seleccionado, tablas de registros y utilidades de benchmark. Su propósito es documentar y reproducir una modificación del selector de cómputo en una única tarjeta RTX 4080 AD103 (no SUPER) modificada a 32 GB de memoria.

El caso demostrado se ejecutó en Windows 11, sin iGPU y sin GPU secundaria ni eGPU: la misma RTX 4080 proporcionaba salida de vídeo y cómputo. La aplicación UEFI precarga Windows Boot Manager, desconecta el driver de firmware de la GPU, realiza la transacción sobre los registros del selector y devuelve el control a Windows. Las medidas de rendimiento se tomaron en WSL2 sobre ese host, con PyTorch 2.8.0+cu128 y CUDA 12.8, con un límite de potencia declarado de 320 W y 32760 MiB de memoria.

Su relevancia es acotada y experimental: la versión v0.4.18 / RUN19 registró escrituras y relecturas correctas de los selectores y persistencia a través de PCIe FLR y de la reconexión del GOP, con arranque de Windows confirmado por el usuario, aunque el registro FBPA no alcanzó el valor solicitado. El repositorio no distribuye dumps de ROM, binarios de firmware de NVIDIA, imágenes de depuración ni logs de ejecución, y el EFI publicado está fijado a identificadores de dispositivo y a un hash de ROM concretos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio no contiene una red neuronal. El hardware objetivo es una GPU NVIDIA Ada Lovelace AD103 (RTX 4080 no SUPER) |
| Parámetros totales | No aplica (no es un modelo de lenguaje) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No aplica; se distribuye código fuente, `BOOTX64.EFI` y payload generado |
| Idiomas soportados | `en`, `ko` (idioma de la documentación del repositorio) |
| Licencia | Código bajo GPL-2.0-only y licencias de terceros aplicables; documentos explicativos/analíticos nuevos bajo CC BY-NC 4.0 con atribución a TOTORONG. La metadatos de Hugging Face no declara licencia. Ver `LICENSE-POLICY.md` |
| Formato de pesos | No aplica; no se distribuyen dumps de ROM/PROM, binarios de firmware de NVIDIA, imágenes de depuración en texto plano ni logs de ejecución |
| Tipo de artefacto | Aplicación UEFI + código fuente compilable + herramientas de extracción de assets stock + verificador de ROM + material de desensamblado + tablas de registros + tooling de benchmark |
| Hardware objetivo | RTX 4080 AD103 no SUPER modificada a 32 GB; PCI ID `10de:2704` / `10de:1795` y un hash de ROM específico |
| Tamaño del repositorio | 0.0 GB (según Hugging Face) |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-10-23 (timestamp del commit en Hugging Face) |

## Arquitectura y entrenamiento

No hay entrenamiento: el artefacto es una aplicación UEFI que ejecuta una secuencia de transacción sobre registros del motor de seguridad de la GPU. El flujo descrito valida dispositivo, mapeo de ROM y hashes de assets; precarga Windows Boot Manager; realiza un `U` manual y desconecta el driver de firmware de la GPU; prepara FWSEC/WPR2; lanza un único `SEC2 START` que intenta en orden `WPR_CFG` → `FBPA` → `WPR` → `FEAT`; comprueba marker, `HALT`, `DEBUGINFO` y las relecturas de PLM requeridas, registrando el desajuste de `FBPA` como no fatal; intenta y relee `SS0` y `SS1` por separado; limpia BME; ejecuta FLR; verifica la recuperación de PCI/GFW/WPR2; libera recursos DMA; reconecta el GOP y arranca Windows.

Las innovaciones técnicas documentadas son de procedimiento, no de modelado: un solo `START` alcanzó tres PLM objetivo, y tratar el desajuste de `FBPA` como no fatal habilitó la etapa final de selectores. Un intento anterior con múltiples `START` agotó el tiempo en la segunda ejecución; el autor plantea el estado residual de un mutex interno como hipótesis, no como diagnóstico establecido. El release presenta el procedimiento y las observaciones sin logs crudos extensos.

## Capacidades

- Escritura y relectura verificada de los selectores `WPR_CFG`, `WPR`, `FEAT`, `SS0` y `SS1` sobre el hardware objetivo, con persistencia a través de PCIe FLR y reconexión del GOP.
- Registro explícito del desajuste de `FBPA`: valor solicitado `0xffffffff` frente a observado `0xffffff0f` tras el disparo.
- Medición de throughput GEMM en FP32, FP16→FP32 y BF16→FP32 con dos tamaños de matriz (N=4096 y N=8192).
- Extracción local de assets stock originales mediante las herramientas incluidas (el usuario debe obtenerlos por su cuenta).
- Verificación de ROM con el comprobador incluido.
- Material de desensamblado anotado y tablas de registros reutilizables para investigación en otras GPU de la serie 40X0, sin que se afirme compatibilidad.
- Tooling de benchmark reproducible sobre WSL2 con PyTorch 2.8.0+cu128 / CUDA 12.8.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión, audio o multilingüismo: no aplica, no es un modelo de lenguaje.

## Casos de uso

- Investigación de configuración de selectores de cómputo en Ada Lovelace: el repositorio ofrece offsets concretos (`WPR_CFG` en `0x001fa7cc`, `WPR` en `0x001fa7c4`, `FEAT` en `0x00823804`, `SS0` en `0x0082381c`, `SS1` en `0x00823820`, `FBPA` en `0x009a0148`) y valores antes/después, lo que permite contrastar hipótesis sobre estos registros sin partir de cero.
- Verificación de persistencia tras resets: el procedimiento incluye FLR y reconexión de GOP con relectura de selectores, útil para determinar si un cambio sobrevive a ciclos de reinicio del dispositivo.
- Medición del impacto en throughput de matriz: el tooling de GEMM permite replicar la comparativa baseline/unlocked en FP16 y BF16 con acumulación y salida en FP32, donde se observaron incrementos de aproximadamente 99,71 % y 100,73 % con N=4096.
- Auditoría de cadena de arranque UEFI: el flujo precarga Windows Boot Manager, desconecta el driver de firmware y devuelve el control al SO, un escenario de interés para investigación en seguridad de pre-arranque.
- Reproducción de pipelines de extracción de assets locales: las herramientas permiten reconstruir los assets stock necesarios a partir de una copia propia de la ROM, sin que el repositorio distribuya material propietario.
- Estudio de límites de una modificación de memoria: la documentación reporta 32760 MiB visibles y 320 W de límite de potencia, datos útiles para comparar con otras modificaciones de la misma familia.
- Base metodológica para investigación en otras 40X0: el material anotado (tablas de registros, desensamblado seleccionado, verificador de ROM) sirve como referencia de método, aunque el autor no reclama compatibilidad con otros modelos.

## Benchmarks y rendimiento

Resultados GEMM reportados (v0.4.18 / RUN19, WSL2, PyTorch 2.8.0+cu128, CUDA 12.8, RTX 4080 AD103 modificada a 32 GB):

| GEMM | N | Baseline (TFLOPS) | Unlocked (TFLOPS) | Incremento |
|---|---:|---:|---:|---:|
| FP32 | 4096 | 34,55 | 35,07 | 1,52 % |
| FP16 → acumulación/salida FP32 | 4096 | 91,54 | 182,80 | 99,71 % |
| BF16 → acumulación/salida FP32 | 4096 | 91,91 | 184,49 | 100,73 % |
| FP32 | 8192 | 33,42 | 33,69 | 0,80 % |
| FP16 → acumulación/salida FP32 | 8192 | 97,77 | 156,28 | 59,85 % |
| BF16 → acumulación/salida FP32 | 8192 | 97,76 | 167,64 | 71,48 % |

Estado de los selectores tras el disparo:

| Nombre | Offset en BAR0 | Antes | Solicitado | Observado tras el disparo |
|---|---|---|---|---|
| WPR_CFG | `0x001fa7cc` | `0x0004cb8f` | `0xfffff0ff` | `0xfffff0ff` |
| FBPA | `0x009a0148` | `0xffffff0f` | `0xffffffff` | `0xffffff0f` |
| WPR | `0x001fa7c4` | `0x0004cb8f` | `0xffffffff` | `0xffffffff` |
| FEAT | `0x00823804` | `0xffffff8f` | `0xffffffff` | `0xffffffff` |
| SS0 | `0x0082381c` | `0x31322012` | `0x88888888` | `0x88888888` |
| SS1 | `0x00823820` | `0x00000007` | `0x00000008` | `0x00000008` |

La comprobación `correctness=True` cubre una comparación muestreada en FP64 y una verificación de NaN/Inf sobre la salida completa, no una certificación numérica exhaustiva ni de estabilidad a largo plazo. No se reclama ninguna mejora en DLSS, RT, FP8 ni en velocidad de LLM a nivel de aplicación.

## Requisitos de hardware

- GPU: una única RTX 4080 AD103 no SUPER modificada a 32 GB, con PCI ID `10de:2704` / `10de:1795` y el hash de ROM específico al que está fijado el EFI distribuido.
- Memoria: 32760 MiB reportados en la configuración demostrada; límite de potencia declarado de 320 W.
- Host: Windows 11 sin iGPU y sin GPU secundaria ni eGPU; la misma tarjeta da salida de vídeo y cómputo.
- Almacenamiento de arranque: medio UEFI con la aplicación `BOOTX64.EFI` y el payload generado; los assets stock deben extraerse localmente con las herramientas del repositorio.
- Entorno de medida: WSL2 sobre el host Windows con PyTorch 2.8.0+cu128 y CUDA 12.8. Otras combinaciones de driver, toolkit o versión de PyTorch no están validadas en la información disponible.
- VRAM estimada para inferencia: no aplica, no es un modelo de IA.
- GPU recomendadas: no aplica; el procedimiento está fijado al hardware descrito y el autor no reclama compatibilidad con otras tarjetas.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. El despliegue consiste en preparar un medio de arranque UEFI y ejecutar la transacción en pre-arranque.
- Latencia y throughput: throughput GEMM medido en la tabla anterior; no se publican latencias de la secuencia de transacción ni tiempos de arranque.

## Comparativa con modelos similares

| Proyecto | Categoría | Objetivo | Licencia | Disponibilidad en este repositorio |
|---|---|---|---|---|
| AD103_win_unlocker (TOTORONG) | Aplicación UEFI + material de investigación | Modificación del selector de cómputo en RTX 4080 AD103 a 32 GB | GPL-2.0-only (código) y CC BY-NC 4.0 (documentos nuevos) | Código, EFI, payload, herramientas y tablas; sin ROM ni firmware |
| Zagitta/gpu-unlock | Investigación upstream citada | Desbloqueo de GPUs (familia no especificada en la información disponible) | No disponible en la información proporcionada | Citado como base; no incluido |
| Investigación Ampere/CMP | Investigación upstream citada | Modificaciones en generaciones Ampere y CMP | No disponible en la información proporcionada | Citado como base; no incluido |
| NVIDIA open kernel modules y envytools | Herramientas upstream citadas | Módulos de kernel abiertos y utilidades de ingeniería inversa de NVIDIA | No disponible en la información proporcionada | Citados como base; no incluidos |

No se dispone de datos para comparar parámetros, contexto ni rendimiento, porque ninguno de los elementos comparados es un modelo de lenguaje. Las búsquedas web realizadas devolvieron únicamente páginas de perfil genéricas de Hugging Face y archivos de modelos de terceros sin relación con este repositorio.

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un modelo de IA; no genera texto, no razona, no soporta tool calling ni tiene ventana de contexto. Cualquier uso esperando capacidades de lenguaje es un error de interpretación.
- Riesgo físico y de datos: el propio autor advierte de posible fallo de arranque, pérdida de salida de vídeo, corrupción de datos, daño del hardware y otras pérdidas. El software se ofrece AS IS, sin garantía.
- Fijación al hardware: el EFI está anclado a `10de:2704` / `10de:1795` y a un hash de ROM concreto; otra tarjeta con el mismo nombre comercial puede ser rechazada. Editar solo las constantes de identidad o de hash no constituye un port validado.
- Resultado incompleto: `FBPA` no alcanzó el valor solicitado (`0xffffffff` solicitado frente a `0xffffff0f` observado). El desajuste se registró como no fatal para poder continuar.
- Reproducibilidad del procedimiento: un intento anterior con múltiples `START` agotó el tiempo en la segunda ejecución; el estado residual de un mutex interno es una hipótesis, no un diagnóstico establecido. No se publican logs crudos que permitan auditar la ejecución completa.
- Alcance de las métricas: la validación numérica se limita a una comparación muestreada en FP64 y a una comprobación de NaN/Inf sobre la salida completa; no hay certificación de estabilidad a largo plazo ni de comportamiento térmico o eléctrico sostenido.
- Ausencia de mejoras en otras cargas: no se reclama mejora en DLSS, RT, FP8 ni en velocidad de LLM a nivel de aplicación, pese a que las ganancias en GEMM FP16/BF16 sean próximas al 100 % con N=4096 y caigan al 59-71 % con N=8192.
- Material no distribuido: no se incluyen dumps de ROM/PROM, binarios de firmware de NVIDIA, imágenes de depuración ni logs; obtener los assets stock es responsabilidad del usuario.
- Licencia: el código es GPL-2.0-only con licencias de terceros aplicables; los documentos explicativos nuevos quedan bajo CC BY-NC 4.0, lo que impide uso comercial de esos textos. No se permite eliminar la atribución original ni presentar trabajo ajeno como propio.
- Idiomas: la documentación está en inglés y coreano; no hay versión en castellano.
- Sin métricas de comunidad: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente pública del procedimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TOTORONG/AD103_win_unlocker
- Perfil del autor: https://huggingface.co/TOTORONG
- README en coreano: `README.ko.md` (en el repositorio)
- Instalación y extracción: `docs/INSTALL.en.md` (en el repositorio)
- Notas de registros y desensamblado: `docs/ANALYSIS.en.md` (en el repositorio)
- Política de licencia: `LICENSE-POLICY.md` (en el repositorio)
- Avisos de terceros: `UPSTREAM-THIRD_PARTY_NOTICES.md` (en el repositorio)
- Avisos de herramientas de firmware: `source/firmware-tools/NOTICE.md` (en el repositorio)
- Upstream citado: Zagitta/gpu-unlock (URL no verificada en la información disponible)
- Upstream citado: investigación Ampere/CMP (URL no disponible)
- Upstream citado: NVIDIA open kernel modules (URL no disponible)
- Upstream citado: envytools (URL no disponible)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
