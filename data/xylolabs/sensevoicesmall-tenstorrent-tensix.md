# Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix

## Resumen

SenseVoiceSmall-Tenstorrent-Tensix es una redistribución de pesos del modelo de reconocimiento automático del habla SenseVoiceSmall (FunAudioLLM/Alibaba Group), preparada por Xylolabs para su ejecución en aceleradores NPU de Tenstorrent con arquitectura Tensix (Wormhole y Blackhole). No se trata de un modelo nuevo ni de un fine-tuning sobre datos adicionales: el autor publica únicamente componentes de proyección y cabezas de salida del encoder en formatos BFP4, BFP8 y BF16, pensados para integrarse en un stack de inferencia propio del hardware Tensix.

El repositorio contiene dos carpetas: `encoder-bfp4-bfp8-bf16/` (1,37 GB, con 280 proyecciones de encoder en BFP4, 281 operandos de proyección/cabeza CTC en BFP8 y 281 alternativas de proyección/cabeza en BF16) y `encoder-bfp8/` (0,52 GB, con 70 capas SAN-M y la cabeza CTC en BFP8/BF16). El preprocesado de audio, la selección de consultas de idioma, la decodificación de tokens y un checkpoint completo ejecutable quedan explícitamente fuera del archivo.

La relevancia de esta ficha es acotada: sirve a desarrolladores que ya trabajan con NPUs Tenstorrent y necesitan pesos cuantizados de SenseVoiceSmall en formatos nativos del hardware (block floating point). Para cualquier otro caso de uso, la referencia canónica es el modelo base `FunAudioLLM/SenseVoiceSmall`. La licencia es la FunASR Model Open Source License Agreement v1.1, y el único componente con licencia Apache 2.0 es el script cargador de Xylolabs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder SAN-M (SenseVoice) con cabeza CTC; exportación de componentes para Tensix |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4, BFP8, BF16 (block floating point) |
| Idiomas soportados | coreano (ko) según metadatos; el modelo base soporta zh, en, ja, ko y yue |
| Licencia | FunASR Model Open Source License Agreement v1.1 (cargador en Apache 2.0) |
| Formato de pesos | safetensors (componentes sueltos, no checkpoint completo) |

## Arquitectura y entrenamiento

El modelo subyacente, SenseVoiceSmall, es un encoder no autorregresivo de tipo SAN-M con cabeza CTC para reconocimiento de voz, diseñado para transcripción de baja latencia. Esta publicación no incluye información sobre el entrenamiento original: no se documentan tokens de audio, composición del dataset, ni si hubo etapas de ajuste supervisado o preferencias. Lo que sí documenta el autor es el proceso de exportación: conversión de proyecciones y cabezas a formatos block floating point (BFP4 y BFP8) compatibles con Tensix, más alternativas en BF16 para mantener precisión.

La innovación técnica de esta release es exclusivamente de despliegue: empaquetado de operandos en BFP4/BFP8 para NPUs Wormhole y Blackhole, con un cargador (`load_components.py`) que permite iterar componentes uno a uno. El autor advierte que para retener el perfil BFP4 guardado debe usarse la cabeza CTC en BFP8 incluida en el mismo repositorio, y que la integración en la arquitectura, los operandos compartidos, el preprocesado y la decodificación de tokens corren a cargo del usuario.

## Capacidades

- Reconocimiento automático del habla (ASR) no autorregresivo mediante encoder SAN-M y decodificación CTC.
- Transcripción en coreano según los metadatos del repositorio; el modelo base cubre además chino, inglés, japonés y cantonés.
- Ejecución de componentes cuantizados en NPUs Tenstorrent Tensix (Wormhole, Blackhole).
- Carga selectiva de componentes por precisión (BFP4, BFP8, BF16) mediante el script incluido.
- No incluye: preprocesado de audio, selección de consultas de idioma, decodificación de tokens ni checkpoint completo ejecutable.
- No se documentan tool calling, capacidades de agente, visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Despliegue de ASR en hardware Tenstorrent: integración de las proyecciones BFP8 del encoder en un pipeline de inferencia sobre Wormhole o Blackhole para transcripción de audio en producción, aprovechando el formato nativo del acelerador.
- Evaluación de precisión de cuantización: comparación de las salidas del encoder con proyecciones BFP4, BFP8 y BF16 sobre el mismo conjunto de audio para medir la degradación de la tasa de error de palabras antes de fijar una configuración.
- Investigación en block floating point: uso de los operandos exportados como banco de pruebas para estudiar el impacto de BFP4/BFP8 en capas SAN-M y en la cabeza CTC.
- Prototipado de pipelines ASR multilingües: partiendo del modelo base SenseVoiceSmall y sustituyendo las capas por las versiones Tensix para validar la paridad funcional en coreano y en los idiomas del modelo original.
- Integración en sistemas embebidos con NPU: consumo de los componentes desde el cargador Apache 2.0 para construir un runtime propio que combine estos pesos con preprocesado y decodificación externos.
- Reproducción de resultados del export sherpa-onnx: uso de los componentes como referencia cruzada frente a la exportación citada por el autor para auditar diferencias numéricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: NPUs Tenstorrent con arquitectura Tensix (Wormhole, Blackhole). No está pensado para GPU convencionales.
- VRAM estimada: no aplica; el consumo depende de la memoria del acelerador Tensix y del conjunto de componentes cargados.
- Tamaño en disco: 1,9 GB de repositorio total (1,37 GB para `encoder-bfp4-bfp8-bf16/` y 0,52 GB para `encoder-bfp8/`).
- GPU recomendadas: no disponible (el autor no documenta ejecución en GPU).
- Compatibilidad con GPU de consumo: no disponible; los formatos BFP4/BFP8 son específicos de Tensix y no se declaran ejecutables en CUDA.
- Opciones de despliegue: cargador propio `load_components.py` (Apache 2.0) sobre PyTorch y safetensors; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix | no disponible | no disponible | ko (metadatos) | FunASR Model License 1.1 | Componentes Tensix, sin checkpoint completo |
| FunAudioLLM/SenseVoiceSmall | no disponible en esta información | no disponible | zh, en, ja, ko, yue | FunASR Model License 1.1 | Modelo base completo en Hugging Face |
| csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17 | no disponible | no disponible | zh, en, ja, ko, yue | no disponible | Export ONNX para sherpa-onnx |

La comparación relevante es frente al modelo base y al export ONNX: ambos ofrecen un artefacto ejecutable de extremo a extremo, mientras que esta release entrega solo componentes parciales para un acelerador concreto.

## Limitaciones y advertencias

- No es un checkpoint ejecutable: faltan preprocesado de audio, selección de consultas de idioma, decodificación de tokens e integración en la arquitectura.
- Los formatos BFP4 y BFP8 son específicos de Tensix; no hay garantía de portabilidad a CUDA, ROCm u otras NPUs.
- El perfil BFP4 requiere usar la cabeza CTC en BFP8 incluida; mezclar precisiones de forma arbitraria puede degradar la precisión.
- Los metadatos declaran únicamente coreano, aunque el modelo base cubre más idiomas; conviene verificar el comportamiento real antes de asumir multilingüismo.
- Licencia FunASR Model License 1.1: permite copia, modificación y distribución con atribución de autoría y retención del nombre del modelo, pero incluye cláusulas de propósito de referencia/aprendizaje, conducta comunitaria, terminación y revisión que deben revisarse antes de uso comercial.
- Riesgo de alucinación y sesgos: no documentados en esta release; heredables del modelo base SenseVoiceSmall.
- Repositorio sin descargas ni likes en el momento de la consulta; ausencia de validación comunitaria.
- No se publican benchmarks de precisión tras la cuantización BFP4/BFP8.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Export sherpa-onnx citado: https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17
- Licencia: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix/blob/main/LICENSE
- Cargador de componentes: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix/blob/main/encoder-bfp4-bfp8-bf16/load_components.py
- Repositorio de herramientas Tensix de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
