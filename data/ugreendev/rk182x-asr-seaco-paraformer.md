# UGREENDEV/RK182X-ASR-SeaCo-Paraformer

## Resumen

RK182X-ASR-SeaCo-Paraformer es una conversión a formato RKNN del modelo de reconocimiento automático de voz (ASR) `iic/speech_seaco_paraformer_large_asr_nat-zh-cn-16k-common-vocab8404-pytorch`, desarrollado originalmente por el Instituto de Investigación de Alibaba (iic) y publicado en ModelScope. El repositorio, mantenido por UGREENDEV, distribuye los pesos ya compilados y cuantizados para su ejecución sobre las NPU de los SoC Rockchip RK1820 y RK1828, con runtime RKNN v1.1.0. No se trata, por tanto, de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue derivado del modelo original.

El modelo origen es un Paraformer con extensión SeaCo (Seamless Context), una arquitectura de ASR no autorregresiva que incorpora un decoder adicional de contexto y un scorer ASF (Acoustic-Semantic Fusion), pensada para transcripción en streaming y en modo offline sobre audio en chino mandarín a 16 kHz con vocabulario de 8404 tokens. La conversión RKNN mantiene separados los componentes `paraformer_encoder`, `paraformer_decoder`, `paraformer_decoder_hotword`, `seaco_decoder` y `asf_scorer`, todos en fp16 y asignados a un núcleo NPU cada uno, mientras que los módulos CIF y BiasEncoder se ejecutan en CPU.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño total es de aproximadamente 0,5 GB y no se proporcionan resultados de benchmarks ni métricas de precisión o latencia. Su interés práctico reside en la integración de ASR en chino sobre hardware Rockchip de bajo consumo, no en la comparación con modelos ASR de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paraformer con extensión SeaCo (encoder-decoder no autorregresivo + decoder de contexto + scorer ASF), convertida a RKNN |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no LLM; ventana de audio no especificada) |
| Tipos de cuantizacion | fp16 en todos los componentes (encoder, decoder, decoder_hotword, seaco_decoder, asf_scorer) |
| Idiomas soportados | chino mandarín (según el identificador del modelo origen `zh-cn`); no se detalla lista oficial |
| Licencia | Apache 2.0 (modelo origen); se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0), con `config.json` y `SHA256SUMS` por configuración |

## Arquitectura y entrenamiento

El modelo subyacente es un Paraformer, un sistema ASR no autorregresivo que predice toda la secuencia de tokens en un solo paso mediante un predictor de duración (CIF, Continuous Integrate-and-Fire) que alinea el audio con los tokens objetivo. La variante SeaCo añade un decoder de contexto que permite condicionar la transcripción con contexto textual previo (por ejemplo, historial de conversación o vocabulario específico), y un scorer ASF que fusiona información acústica y semántica para mejorar la precisión en escenarios de streaming. El vocabulario es de 8404 tokens y la entrada es audio a 16 kHz en chino mandarín.

La conversión a RKNN reorganiza el grafo en cinco submodelos independientes, cada uno con un núcleo NPU asignado y precisión fp16. Los módulos CIF y BiasEncoder permanecen en CPU, lo que implica que el pipeline completo requiere orquestación entre NPU y CPU en el dispositivo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o ajuste fino; estos datos corresponden al modelo origen y no se detallan en la model card del repositorio.

## Capacidades

- Reconocimiento automático de voz en chino mandarín sobre audio a 16 kHz.
- Transcripción no autorregresiva con alineación temporal mediante CIF.
- Decodificación con contexto (SeaCo) para aprovechar historial textual previo.
- Soporte de hotwords mediante el componente `paraformer_decoder_hotword`, orientado a sesgar el reconocimiento hacia términos específicos.
- Fusión acústico-semántica mediante el scorer ASF.
- Ejecución sobre NPU Rockchip RK1820 y RK1828 con runtime RKNN v1.1.0.
- No se documenta soporte de tool calling, agentes, visión, audio multimodal ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones en chino en dispositivos embebidos: el modelo puede ejecutarse sobre SoC Rockchip RK1820/RK1828 integrados en equipos de videoconferencia, aprovechando los cinco submodelos en NPU y los módulos CIF/BiasEncoder en CPU para producir transcripciones en tiempo real sin depender de la nube.
- Subtitulado automático en kioscos y paneles informativos: al ser un modelo no autorregresivo con alineación CIF, permite generar subtítulos con marcas temporales sobre audio de 16 kHz, adecuado para flujos de streaming en hardware de bajo consumo.
- Dictado por voz en aplicaciones de productividad locales: la decodificación con hotwords permite adaptar el reconocimiento a vocabulario técnico o nombres propios de un dominio concreto, reduciendo errores en entradas específicas.
- Asistentes de voz embebidos en electrodomésticos: la ejecución sobre NPU Rockchip permite integrar ASR en dispositivos domésticos con presupuesto térmico y energético limitado, sin GPU dedicada.
- Transcripción de llamadas o atención al cliente en chino: la variante SeaCo con contexto textual puede aprovechar el historial de la conversación para mejorar la coherencia de la transcripción en diálogos multi-turno.
- Digitalización de archivos de audio en entornos sin conectividad: al ser un artefacto local con pesos de aproximadamente 0,5 GB, puede desplegarse en equipos edge para procesar grabaciones de audio en chino sin enviar datos a servicios externos.
- Integración en pipelines de verificación de integridad: el repositorio incluye `SHA256SUMS` por configuración, lo que permite validar los pesos antes de desplegarlos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828 (NPU integrada); no está pensado para GPU de escritorio ni para CPU genérica.
- Runtime requerido: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión del dispositivo con `rknn-smi -v` antes de ejecutar.
- Precisión: todos los submodelos en fp16; no se distribuyen variantes int8 ni GGUF.
- Componentes en CPU: CIF y BiasEncoder, que deben orquestarse junto con los cinco submodelos en NPU.
- VRAM estimada: no disponible; el consumo depende de la memoria compartida del SoC Rockchip, no de VRAM dedicada.
- Cabe en GPU consumer: no aplicable; el artefacto es específico para NPU Rockchip.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1820/RK1828; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-ASR-SeaCo-Paraformer (este) | no disponible | no disponible | sin benchmarks publicados | Apache 2.0 + términos RKNN | Hugging Face y ModelScope, 0 descargas |
| iic/speech_seaco_paraformer_large_asr_nat-zh-cn-16k-common-vocab8404-pytorch (origen) | no disponible | no disponible | sin datos en esta ficha | Apache 2.0 | ModelScope |
| Alternativas ASR en chino de gran escala (por ejemplo, Whisper large-v3) | no disponible en esta ficha | no disponible | sin datos en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas; la comparación relevante es con el modelo origen, del que este repositorio es una conversión RKNN.

## Limitaciones y advertencias

- Es un artefacto derivado, no un modelo entrenado: cualquier mejora o limitación de precisión proviene del modelo origen `iic/speech_seaco_paraformer_large_asr_nat-zh-cn-16k-common-vocab8404-pytorch`.
- Solo soporta chino mandarín según el identificador del modelo origen; no se documenta cobertura multilingüe.
- Dependencia estricta del runtime RKNN v1.1.0 y del driver correspondiente; versiones distintas pueden impedir la ejecución.
- Los cinco submodelos deben usarse conjuntamente desde el mismo directorio de configuración; mezclar archivos de configuraciones distintas no está soportado.
- CIF y BiasEncoder se ejecutan en CPU, lo que introduce dependencia del rendimiento de la CPU del SoC y requiere orquestación explícita.
- No se publican métricas de WER, latencia ni throughput, por lo que no es posible evaluar su precisión en producción a partir de la información disponible.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en el repositorio.
- Licencia Apache 2.0 para el modelo origen, con términos adicionales de RKNN Toolkit y RKNN Runtime que deben revisarse antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (2026-11-19), lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-ASR-SeaCo-Paraformer
- Modelo origen en ModelScope: https://modelscope.cn/models/iic/speech_seaco_paraformer_large_asr_nat-zh-cn-16k-common-vocab8404-pytorch
- Documentación de configuración: `SeaCo-Paraformer-fp16-1/README.md` (incluida en el repositorio)
- Checksums: `SeaCo-Paraformer-fp16-1/SHA256SUMS` (incluido en el repositorio)
- Licencia y atribución: `LICENSE` y `Notice` en la raíz del repositorio
