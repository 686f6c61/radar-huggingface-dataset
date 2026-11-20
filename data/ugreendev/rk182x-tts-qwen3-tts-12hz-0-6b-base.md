# UGREENDEV/RK182X-TTS-Qwen3-TTS-12Hz-0.6B-Base

## Resumen

RK182X-TTS-Qwen3-TTS-12Hz-0.6B-Base es una conversión al formato RKNN del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-Base de Qwen, publicada por UGREENDEV. El objetivo no es ofrecer un modelo nuevo, sino un artefacto listo para ejecutarse sobre las NPU Rockchip RK1820 y RK1828, con cuantización mixta por componente (w4a16 y w8a16) y reparto explícito de núcleos NPU. Es, por tanto, una pieza de despliegue en el borde (edge) más que un modelo de investigación.

El modelo base es un TTS de aproximadamente 0,6 mil millones de parámetros, identificado por el sufijo "12Hz", que sugiere una tasa de generación de tokens de audio de 12 Hz en el decodificador de voz. La conversión descompone el sistema en cuatro módulos: Talker (generador de tokens semánticos), Code Predictor (predicción de códigos acústicos), Speech Decoder (decodificador de forma de onda) y Text Projector (proyección del texto de entrada). Cada uno tiene su propia cuantización y asignación de núcleos.

Su relevancia es acotada pero concreta: permite llevar un TTS de calidad razonable a dispositivos con NPU Rockchip sin depender de GPU, algo útil en electrodomésticos, terminales de atención al público o hardware empotrado. La licencia Apache 2.0 del modelo fuente facilita el uso comercial, aunque la ficha no documenta idiomas soportados ni resultados de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en transformer con modulos Talker, Code Predictor, Speech Decoder y Text Projector (detalles del modelo base no disponibles) |
| Parametros totales | 0,6B (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Talker: w4a16; Code Predictor: w8a16; Speech Decoder: w4a16; Text Projector: w4a16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo fuente); aplican ademas las licencias de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); repositorio de 1,4 GB con checksums SHA-256 |
| Chips soportados | RK1820, RK1828 |
| Nucleos NPU | Talker: 8; Code Predictor: 8; Speech Decoder: 8; Text Projector: 1 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3-TTS-12Hz-0.6B-Base ni su proceso de entrenamiento (tokens, composicion del dataset, RLHF/DPO). Lo que si documenta esta ficha es la estructura de despliegue: el sistema se divide en cuatro submodelos con cuantizacion diferenciada. El Talker, el Code Predictor y el Speech Decoder usan 8 nucleos NPU cada uno y cuantizacion w4a16 (salvo el Code Predictor, que usa w8a16, presumiblemente por sensibilidad a la precision en la prediccion de codigos acusticos). El Text Projector, mas ligero, usa 1 nucleo y w4a16.

El sufijo "12Hz" del nombre apunta a una tasa de tokens de audio de 12 Hz en el decodificador, un dato que no se confirma en la documentacion. La conversion se realizo con RKNN Runtime v1.1.0 y requiere usar conjuntamente todos los ficheros de un mismo directorio de configuracion, verificando previamente los checksums SHA-256. No se documentan innovaciones como decodificacion especulativa ni atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto de entrada, mediante el pipeline `text-to-speech`.
- Generacion de audio en formato de onda a traves del modulo Speech Decoder.
- Ejecucion en NPU Rockchip RK1820 y RK1828 con reparto de nucleos por modulo.
- Cuantizacion mixta por componente para reducir huella de memoria en el dispositivo.
- Verificacion de integridad mediante SHA-256SUMS antes del despliegue.
- Soporte de tool calling, agentes, vision, audio de entrada o modo thinking: no disponible.
- Capacidades multilingues: no disponible (los idiomas no estan documentados).

## Casos de uso

- Sintesis de voz en electrodomesticos conectados: el modelo cabe en la NPU RK1820/RK1828 de un dispositivo empotrado, permitiendo respuestas habladas locales sin enviar texto a la nube y sin coste de inferencia por token.
- Terminales de atencion al publico (tótems, paneles informativos): generar avisos y respuestas habladas en el propio dispositivo, con latencia independiente de la red y funcionamiento offline.
- Lectura de notificaciones y alertas en dispositivos de asistencia: convertir texto de sensores o mensajes del sistema en voz, aprovechando la cuantizacion w4a16 para mantener el consumo energetico bajo.
- Interfaces de voz para robótica de bajo coste: integrar el TTS en la placa junto al resto del pipeline de percepcion, usando el reparto de 8 nucleos NPU para el Talker y el Speech Decoder.
- Kioscos de información en comercio minorista: anuncios de promociones o instrucciones de uso generados dinámicamente a partir de texto, con despliegue local y verificacion de integridad de los pesos.
- Prototipado de producto con NPU Rockchip: validar la experiencia de voz de un futuro producto antes de comprometerse con un hardware con GPU, dado que el artefacto ya viene cuantizado y con checksums listos para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chips soportados: exclusivamente Rockchip RK1820 y RK1828. No es un modelo para GPU generica ni para CPU convencional.
- Runtime: RKNN Runtime v1.1.0, con driver compatible; comprobar la version en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Huella: repositorio de 1,4 GB; el peso en memoria depende de la configuracion w4a16-8 y de los buffers de activacion del runtime (no cuantificados en la documentacion).
- NPU: 8 nucleos para Talker, 8 para Code Predictor, 8 para Speech Decoder y 1 para Text Projector.
- GPU recomendadas: no aplica; el modelo esta empaquetado para NPU Rockchip.
- Cabe en GPU de consumo: no disponible, al no existir pesos en formato estandar (safetensors/GGUF) en este repositorio.
- Opciones de despliegue: RKNN Toolkit / RKNN Runtime sobre RK1820 o RK1828. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-TTS-Qwen3-TTS-12Hz-0.6B-Base | 0,6B (base) | no disponible | RKNN | Apache 2.0 | Hugging Face y ModelScope |
| Qwen3-TTS-12Hz-0.6B-Base (modelo fuente) | 0,6B | no disponible | no disponible | Apache 2.0 | Hugging Face (Qwen) |
| Otros TTS de ~0,5-1B para edge | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo fuente, del que este repositorio es una conversion cuantizada. No se dispone de informacion sobre alternativas TTS comparables en tamano, contexto o rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona en RK1820 y RK1828; no es portable a GPU, CPU o NPU de otros fabricantes.
- Versionado estricto: requiere RKNN Runtime v1.1.0 y driver compatible; una version distinta puede impedir la ejecucion.
- Mezcla de ficheros: deben usarse juntos todos los ficheros del directorio de configuracion `Qwen3-TTS-12Hz-0.6B-Base-w4a16-8`; mezclar versiones rompe la inferencia.
- Verificacion obligatoria: ejecutar `sha256sum -c SHA256SUMS` y desplegar solo si todas las entradas muestran `OK`.
- Idiomas no documentados: no se puede confirmar el soporte multilingue ni la calidad en castellano.
- Sesgos y alucinacion: no documentados en la informacion disponible; en TTS el riesgo se traduce en prosodia incorrecta o pronunciacion erronea, no en texto inventado.
- Licencia: el modelo fuente es Apache 2.0, pero se aplican tambien las licencias de RKNN Toolkit y RKNN Runtime, que pueden imponer condiciones adicionales al uso comercial del artefacto convertido.
- Sin benchmarks: no hay datos publicados de calidad de sintesis (MOS, WER, latencia) en este repositorio.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-TTS-Qwen3-TTS-12Hz-0.6B-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- ModelScope (mismo repositorio): busqueda por `UGREENDEV/RK182X-TTS-Qwen3-TTS-12Hz-0.6B-Base`
- Documentacion de configuracion: `Qwen3-TTS-12Hz-0.6B-Base-w4a16-8/README.md` (ingles) y `README_CN.md` (chino) dentro del repositorio
- Licencia del modelo fuente: `LICENSE` en el repositorio
- Atribucion y detalles de conversion: `NOTICE` en el repositorio
