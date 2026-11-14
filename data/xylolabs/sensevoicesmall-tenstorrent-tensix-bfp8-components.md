# Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-BFP8-Components

## Resumen

SenseVoiceSmall-Tenstorrent-Tensix-BFP8-Components es un archivo parcial de tensores derivado de SenseVoiceSmall, el modelo de reconocimiento de voz de FunAudioLLM (Alibaba Group). Lo publica Xylolabs y no es un modelo ejecutable de extremo a extremo, sino un conjunto de componentes de operadores decodificados a safetensors portables, pensados para su integración en el backend Tensix de los aceleradores Tenstorrent. El archivo requiere un adaptador de arquitectura y un pipeline de preprocesado de audio externos para funcionar.

El contenido abarca 70 capas SAN-M y la cabeza CTC, con 1.129 tensores en total: 280 matrices de proyección del encoder y la cabeza CTC almacenadas como valores BFP8 retenidos exactamente en BF16 (8,5 bits por peso empaquetado), y 848 operandos de normalización, sesgo, taps y constantes estáticas en BF16. El archivo portable ocupa unos 0,52 GB en BF16, mientras que los datos nativos tileados suman aproximadamente 0,38 GB de memoria de dispositivo para los pesos de componente, sin contar buffers de trabajo.

Su relevancia es de nicho: sirve a quienes despliegan reconocimiento de voz sobre hardware Tenstorrent y necesitan los operandos ya decodificados y verificados, con hashes y formas comprobadas contra el ONNX original. No incluye preprocesado de audio, selección general de consultas de lenguaje, decodificación de tokens ni un checkpoint completo ejecutable, y no reporta evaluaciones de velocidad ni de calidad de reconocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAN-M (SenseVoice) con 70 capas y cabeza CTC; export de componentes de operadores para Tensix |
| Parametros totales | no disponible (el archivo contiene 1.129 tensores de componente, no un checkpoint completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de ASR; perfil fijo de 128 filas: 4 de consulta y 124 de características acústicas) |
| Tipos de cuantizacion | BFP8 empaquetado (8,5 bits por peso) retenido en BF16; BF16; variante tap32q8 con valores redondeados a BFP8 en BF16 |
| Idiomas soportados | coreano (ko) en este perfil de consultas; el modelo base cubre más idiomas, no detallados aquí |
| Licencia | FunASR Model Open Source License Agreement v1.1 (loader en Apache 2.0) |
| Formato de pesos | safetensors (BF16 portable, ~0,52 GB); datos nativos tileados ~0,38 GB |

## Arquitectura y entrenamiento

El modelo base SenseVoiceSmall es un reconocedor de voz con encoder SAN-M y cabeza CTC, orientado a transcripción multilingüe con etiquetado de eventos, emoción e ITN. Este repositorio no reentrena ni modifica los pesos: decodifica los tensores de operadores del ONNX original a safetensors portables conservando cada valor, y documenta las transformaciones aplicadas (escalado de consultas ya plegado, redondeo BFP8, disposición de taps FSMN y constantes estáticas). No se aporta información sobre el dataset de entrenamiento original, número de tokens ni uso de RLHF/DPO en la información disponible.

La innovación técnica del export es la preservación exacta de la representación: las 280 matrices de proyección y la cabeza CTC se guardan como valores BFP8 retenidos en BF16, con 8,5 bits por peso al empaquetarse, y los 848 operandos restantes en BF16, incluyendo una alternativa de taps redondeada a BFP8. `component.json` registra forma y dtype almacenado de cada tensor, y los nombres acabados en `.bfloat8_b` identifican operandos empaquetados en BFP8. Se conservan varias disposiciones de taps FSMN como alternativas, y las matrices mantienen su disposición de operador guardada, habitualmente `[in, out]`.

## Capacidades

- Exportación de componentes de operadores para el backend Tensix de Tenstorrent, no un modelo de inferencia autónomo.
- Contiene 70 capas SAN-M y la cabeza CTC del reconocedor SenseVoiceSmall.
- Perfil de consultas fijo para coreano, con etiquetas de evento, emoción e ITN activado.
- 128 filas de perfil: 4 filas de consulta y 124 filas de características acústicas.
- Varias disposiciones de taps FSMN retenidas como alternativas de implementación.
- Verificación de integridad: hashes, nombres, formas, dtypes originales y valores finitos.
- No incluye preprocesado de audio (fbank/LFR/CMVN), selección general de consultas de lenguaje, decodificación de tokens ni checkpoint ejecutable.
- No realiza reconocimiento de voz por sí mismo.

## Casos de uso

- Despliegue de ASR sobre aceleradores Tenstorrent: integración de los 1.129 tensores de operador en el backend Tensix mediante el loader incluido y un adaptador de arquitectura SenseVoiceSmall propio, para ejecutar transcripción en hardware Tenstorrent.
- Verificación de fidelidad de conversión: comparación de los tensores portables contra el ONNX original usando los hashes y comprobaciones de forma y dtype documentados, útil en auditorías de pipelines de cuantización.
- Investigación en cuantización BFP8: estudio de operandos BFP8 retenidos en BF16 y de la variante tap32q8 para analizar el impacto del redondeo en las capas SAN-M.
- Reimplementación de FSMN: selección entre las distintas disposiciones de taps conservadas para validar implementaciones alternativas del filtro de memoria en el encoder.
- Pipeline de ASR coreano con etiquetado: combinación de estos componentes con preprocesado fbank/LFR/CMVN y decodificación de tokens externos para obtener transcripción con eventos, emoción e ITN en coreano.
- Validación en simulador TT-NN: repacking de los 281 operandos BFP8 y 848 BF16 a través de TT-NN 0.81.1 en contexto de simulador, como paso previo al despliegue en silicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta verificaciones de integridad: los 1.129 tensores coinciden con los arrays fuente, los 281 operandos BFP8 y 848 BF16 reempaquetan exactamente a través de TT-NN 0.81.1 en simulador, el ONNX original coincide con su hash LFS fijado y todos los valores son finitos. No se reporta velocidad ni evaluación de reconocimiento de voz.

## Requisitos de hardware

- Memoria de dispositivo: ~0,38 GB para los pesos de componente nativos tileados, más espacio para buffers de trabajo.
- Almacenamiento: ~0,52 GB para el archivo safetensors portable en BF16.
- Hardware objetivo: aceleradores Tenstorrent con backend Tensix; el repacking se valida con TT-NN 0.81.1 en simulador.
- GPU consumer: no aplica como objetivo; el export está orientado a Tensix, aunque los tensores son legibles en PyTorch en cualquier máquina.
- Despliegue: loader `load_components.py` con PyTorch, safetensors y huggingface_hub; requiere además la arquitectura SenseVoiceSmall original, features fbank/LFR/CMVN compatibles y decodificación de tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-BFP8-Components | no disponible (1.129 tensores de componente) | no disponible | FunASR Model 1.1 | Hugging Face, componentes parciales |
| FunAudioLLM/SenseVoiceSmall (base) | no disponible | no disponible | FunASR Model 1.1 | Hugging Face, checkpoint completo |
| csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17 | no disponible | no disponible | no disponible | Hugging Face, export ONNX |

La comparación se limita a los derivados directos del mismo modelo base citados en la model card; no se dispone de datos de rendimiento para contrastar con alternativas de otros autores.

## Limitaciones y advertencias

- No es un modelo ejecutable: no realiza reconocimiento de voz sin arquitectura, preprocesado y decodificador externos.
- Perfil de consultas fijo para coreano; no cubre selección general de consultas de lenguaje ni otros idiomas en este archivo.
- No incluye preprocesado de audio (fbank/LFR/CMVN) ni decodificación de tokens.
- El escalado de consultas ya está plegado: aplicarlo de nuevo produce resultados incorrectos.
- Las matrices conservan disposición `[in, out]`; hay que respetarla en la integración.
- Es necesario elegir una única implementación FSMN compatible y su representación de taps correspondiente.
- No se reportan evaluaciones de calidad de reconocimiento ni de velocidad; las verificaciones solo cualifican la representación guardada.
- Licencia FunASR Model Open Source License v1.1: permite uso, copia, modificación y distribución con atribución a la fuente y retención del nombre del modelo; incluye cláusula de propósito de referencia/aprendizaje, conducta comunitaria, terminación y revisiones. Revisar antes de uso comercial.
- Se entrega tal cual, sin garantía.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-BFP8-Components
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Export sherpa-onnx citado: https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17
- Loader de componentes: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-BFP8-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tenstorrent-Tensix-BFP8-Components/blob/main/LICENSE
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Repositorio de código Tensix BFP GPTQ: https://github.com/XylolabsInc/tensix-bfp-gptq
