# tm13911391/rayan-apps

## Resumen
Rayan es una aplicación de asistencia conversacional en persa desarrollada por el usuario tm13911391, distribuida a través de este repositorio de Hugging Face. No se trata de un modelo de lenguaje publicado con pesos propios, sino de un paquete de distribución de aplicaciones cliente (Android y Windows, más una PWA para Apple) que envuelven un modelo Gemma 3 1B cuantizado en Q4_K_M y ejecutado localmente mediante llama.cpp compilado a WebAssembly (wllama).

La relevancia del repositorio radica en su enfoque de despliegue: ofrece un modo sin conexión que descarga aproximadamente 800 MB de pesos GGUF en el primer uso y permite inferencia local en el dispositivo, sin depender de una API remota. El repositorio ocupa 0,2 GB y no contiene una model card técnica al uso, sino instrucciones de instalación y notas sobre firmas de aplicaciones.

Conviene subrayar que el objeto publicado aquí son los binarios de la aplicación y su infraestructura de distribución, no un modelo entrenado por el autor. Cualquier evaluación técnica del comportamiento del asistente debe remitirse al modelo subyacente (Gemma 3 1B) y al repositorio de pesos cuantizados referenciado, no a este paquete.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete distribuye aplicaciones; el modelo subyacente es Gemma 3 1B) |
| Parametros totales | no disponible (modelo subyacente declarado: 1B) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) para el modo sin conexión |
| Idiomas soportados | persa (asistente Persian-first); resto no disponible |
| Licencia | other |
| Formato de pesos | GGUF (referenciado en tm13911391/rayan-gguf); binarios APK y ZIP en este repositorio |

## Arquitectura y entrenamiento
Este repositorio no documenta arquitectura ni proceso de entrenamiento propios. Lo que describe es una capa de distribución: una aplicación Android nativa basada en WebView (minSdk 24, es decir, Android 7.0 o superior) y una aplicación de escritorio para Windows construida con Electron 45. Ambas cargan el sitio https://tm13911391-rayan.static.hf.space y le comunican su condición de aplicación mediante indicadores como `window.RAYAN_APP === true`, `window.RayanNative` y el token de user-agent `RayanApp/1.0`.

La inferencia local se apoya en llama.cpp compilado a WebAssembly (wllama) sobre un modelo Gemma 3 1B cuantizado en Q4_K_M, alojado en el repositorio tm13911391/rayan-gguf. No se especifican tokens de entrenamiento, composición del dataset ni si hubo ajuste por RLHF o DPO para el asistente. La innovación técnica destacable es exclusivamente de despliegue: ejecución de un transformer de 1B en el navegador o WebView del dispositivo sin backend, con descarga diferida de pesos y verificación de integridad mediante `SHA256SUMS.txt`.

## Capacidades
- Asistencia conversacional en persa como idioma principal del producto.
- Modo sin conexión con inferencia local en el dispositivo tras una descarga única de aproximadamente 800 MB.
- Distribución multiplataforma: APK para Android 7.0+, ZIP portable para Windows 10/11 x64 y PWA instalable desde Safari en iPhone, iPad y Mac.
- Ejecución de un modelo de 1B mediante llama.cpp/wllama, sin requisito de GPU dedicada.
- Verificación de descargas mediante ficheros de sumas SHA-256.
- Soporte de tool calling, function calling, agentes, visión, audio o modo de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso
- Asistencia conversacional en persa sin conectividad: el modo sin conexión permite responder consultas básicas en dispositivos Android o Windows una vez descargados los pesos, útil en entornos con red intermitente o restringida.
- Despliegue en dispositivos de gama baja: al ejecutar un modelo de 1B en Q4_K_M sobre llama.cpp, el consumo de memoria es moderado y no exige GPU, lo que facilita su uso en equipos antiguos.
- Distribución de aplicaciones de escritorio portable: el ZIP de Windows no requiere instalador ni privilegios de administrador, adecuado para entornos corporativos con políticas restrictivas de instalación.
- Acceso vía PWA en ecosistema Apple: al no existir binario nativo para iOS o macOS, la instalación como aplicación web desde Safari cubre ese hueco sin cuenta de desarrollador de pago.
- Evaluación de pipelines de inferencia en WebAssembly: el uso de wllama sirve como referencia práctica para equipos que quieran medir el rendimiento de llama.cpp compilado a WASM en WebView.
- Integración en flujos de trabajo sin backend propio: la aplicación apunta a un sitio estático alojado en Hugging Face Spaces, lo que simplifica el mantenimiento de la infraestructura de servicio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Almacenamiento: aproximadamente 800 MB adicionales para el paquete de modo sin conexión, además del tamaño de la aplicación.
- VRAM: no aplica; la inferencia se ejecuta en CPU mediante llama.cpp/wllama.
- Memoria RAM estimada: no disponible de forma explícita; un modelo de 1B en Q4_K_M requiere del orden de 1 GB para pesos y overhead de ejecución, aunque el dato no está confirmado en la documentación.
- GPU recomendadas: no disponibles; no se declara aceleración por GPU.
- Compatibilidad en GPU de consumo: no aplica al tratarse de ejecución en CPU/WASM.
- Opciones de despliegue: aplicaciones Android (APK) y Windows (Electron 45), más PWA en Safari; el motor subyacente es llama.cpp compilado a WebAssembly (wllama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rayan (este repositorio) | no disponible (subyacente 1B) | no disponible | other | APK, ZIP, GGUF referenciado | Paquete de aplicaciones, no modelo |
| Gemma 3 1B | 1B | no disponible en esta ficha | términos de Gemma | safetensors, GGUF (vía terceros) | Modelo base usado por Rayan |
| Alternativas de asistente en persa | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificable |

No se dispone de datos suficientes para establecer una comparación cuantitativa con otros asistentes o modelos de la misma categoría.

## Limitaciones y advertencias
- Este repositorio no contiene un modelo entrenado ni una model card técnica; contiene binarios de aplicación y documentación de instalación.
- La licencia figura como "other" sin texto adicional, por lo que las condiciones de uso comercial no están claras y deben consultarse con el autor.
- Las aplicaciones no están firmadas con un certificado de pago: Android y Windows mostrarán advertencias de seguridad (Play Protect, SmartScreen) y requieren habilitar la instalación desde orígenes desconocidos.
- No hay binarios nativos para iOS, iPadOS ni macOS; la única vía es la PWA desde Safari, con las limitaciones propias de una aplicación web.
- El modo sin conexión ofrece respuestas "más simples" según la propia documentación, al ejecutarse sobre un modelo de 1B cuantizado.
- El primer uso requiere conexión a internet para descargar los pesos.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad en persa.
- El rendimiento real depende del dispositivo y de la implementación WASM; no se publican métricas de latencia.
- Al depender de un sitio alojado en Hugging Face Spaces, la disponibilidad del servicio en línea queda sujeta a esa infraestructura.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/tm13911391/rayan-apps
- Pesos cuantizados referenciados: https://huggingface.co/tm13911391/rayan-gguf
- APK Android: https://huggingface.co/tm13911391/rayan-apps/resolve/main/Rayan-Android.apk
- ZIP Windows x64: https://huggingface.co/tm13911391/rayan-apps/resolve/main/Rayan-Windows-x64.zip
- Sumas de verificación: https://huggingface.co/tm13911391/rayan-apps/resolve/main/SHA256SUMS.txt
- Sitio de la aplicación: https://tm13911391-rayan.static.hf.space
