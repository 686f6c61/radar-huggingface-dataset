# Vantuk/model_set_v73

## Resumen

Vantuk/model_set_v73 es un conjunto de modelos empaquetados por el usuario Vantuk bajo el paraguas "Speakilo / OneVoice On-Device Model Set", diseñado específicamente para ejecutar un pipeline completo de voz a voz (speech-to-speech) en un dispositivo móvil con SoC Qualcomm Snapdragon 8 Gen 2 (SM8550) y NPU Hexagon HTP v73. No se trata de un único modelo de lenguaje, sino de una colección de 388 ficheros (1,877 GB) que cubre detección de idioma hablado, reconocimiento automático del habla (ASR), evaluación de calidad de fuente, traducción automática y síntesis de voz (TTS), repartiendo cada etapa entre la NPU (vía QNN SDK 2.51.0) y la CPU (vía Sherpa-ONNX y llama.cpp).

El componente de mayor tamaño es un modelo de traducción de 1.601.173.504 parámetros en formato GGUF cuantizado Q4_0, identificado en la model card como "Tier 2A Hy-MT2-1.8B-Q4_0-enviko32k", que se ejecuta en CPU con llama.cpp y las extensiones KleidiAI (+dotprod+i8mm). El resto de etapas son modelos especializados mucho más pequeños: ECAPA para LID en NPU, Gipformer y SenseVoice para ASR, y modelos Piper para TTS en coreano, vietnamita e inglés.

La relevancia de este paquete es su enfoque en inferencia totalmente local y offline sobre hardware móvil de gama alta, con licencia Apache 2.0 y compatibilidad declarada con endpoints. Es un artefacto de despliegue más que un modelo fundacional publicable, orientado a integradores que necesiten una cadena de voz multilingüe (vi/en/ko) sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto multi-modelo: ECAPA (LID), Gipformer y SenseVoice (ASR), transformer de traducción (MT, 1.8B), Piper (TTS); no disponible el detalle arquitectónico del modelo de traducción |
| Parametros totales | 1.601.173.504 (componente de traducción, safetensors); el resto de etapas no declara recuento |
| Parametros activos | no disponible |
| Longitud de contexto | 32k (según el nombre del fichero de traducción "enviko32k"); no confirmado para el resto de etapas |
| Tipos de cuantizacion | Q4_0 para el modelo de traducción (GGUF); INT8 para ASR (Gipformer, SenseVoice); cuantización QNN para etapas NPU; imatrix como tag |
| Idiomas soportados | Vietnamita, inglés, coreano (ASR y TTS); traducción vi/en/ko según el nombre del fichero MT |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, ONNX, safetensors (repo mixto); QNN para Hexagon v73 |

## Arquitectura y entrenamiento

El paquete no documenta el entrenamiento de sus componentes; se limita a describir el pipeline de despliegue. La cadena consta de cinco etapas: (1) detección de idioma hablado con ECAPA sobre NPU; (2a-2c) ASR con Gipformer INT8 para vietnamita y SenseVoice INT8 para inglés/coreano, más un ASR en streaming para coreano, todos en CPU vía Sherpa-ONNX; (3) evaluación de "source readiness" en NPU; (4) traducción con un transformer de 1,8B parámetros cuantizado Q4_0, ejecutado en llama.cpp con KleidiAI; y (5a-5d) TTS Piper híbrido, con el codificador/flow en CPU y el decodificador en NPU QNN HTP v73, más datos eSpeak-NG para G2P en inglés y vietnamita.

La innovación técnica declarada es la orquestación heterogénea NPU/CPU sobre Hexagon v73 (soc_model 43, htp_arch 73) con QNN SDK 2.51.0, y el uso de cuantización Q4_0 con imatrix para el modelo de traducción. No se aportan datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en ninguno de los componentes.

## Capacidades

- Detección de idioma hablado (spoken LID) mediante ECAPA acelerado en NPU.
- Reconocimiento automático del habla en vietnamita (Gipformer INT8) e inglés/coreano (SenseVoice INT8), con variante de ASR en streaming para coreano.
- Evaluación de calidad o preparación de la fuente de audio ("source readiness") en NPU.
- Traducción automática multilingüe vi/en/ko con un modelo de 1,8B parámetros y contexto de 32k.
- Síntesis de voz (TTS) en coreano (piper-ko-kss, corpus KSS), vietnamita (piper-vi-vais1000) e inglés (piper-en-lessac).
- Conversión grafema-fonema mediante eSpeak-NG para inglés y vietnamita.
- Ejecución completamente on-device y offline en Snapdragon 8 Gen 2.
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- No se declara soporte de tool calling, agentes, visión ni audio de entrada más allá del propio pipeline de voz.

## Casos de uso

- Traducción de voz en tiempo real en movilidad: el pipeline encadena ASR, traducción (1,8B, contexto 32k) y TTS para convertir una intervención hablada en vietnamita, inglés o coreano en audio traducido, sin conexión de red.
- Asistentes de voz embebidos en aplicaciones Android de gama alta: al ejecutarse sobre Hexagon HTP v73 y CPU con Sherpa-ONNX, permite integrar dictado y respuesta hablada en apps sin backend.
- Interpretación presencial en entornos con conectividad limitada: útil en viajes, atención sanitaria de campo o entornos industriales donde no se puede enviar audio a la nube.
- Subtitulado y transcripción local multilingüe: las etapas ASR (Gipformer, SenseVoice) generan transcripciones en vi/en/ko que pueden registrarse o mostrarse en pantalla, con la etapa de "source readiness" filtrando audio de baja calidad antes de procesar.
- Lectura de texto a voz para accesibilidad: los modelos Piper permiten narrar contenido en inglés, vietnamita y coreano con latencia baja al delegar el decodificador en la NPU.
- Prototipado de pipelines de voz heterogéneos: sirve como referencia para ingenieros que quieran repartir cargas entre NPU QNN y CPU llama.cpp/Sherpa-ONNX en un SoC Qualcomm.
- Evaluación de cuantización Q4_0 con imatrix en traducción: el componente de 1,8B permite medir calidad y velocidad de un modelo MT cuantizado en CPU móvil con KleidiAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo declarado: SoC Qualcomm Snapdragon 8 Gen 2 (SM8550) con NPU Hexagon HTP v73 (soc_model 43, htp_arch 73) y QNN SDK 2.51.0.
- El componente de traducción (1,8B en Q4_0) requiere aproximadamente 1 GB de pesos más overhead de contexto; el repo completo ocupa 2,0 GB (1,877 GB según la model card).
- No se especifican requisitos de VRAM para GPU de escritorio; el diseño es para inferencia en CPU y NPU móvil.
- Despliegue: llama.cpp (con KleidiAI +dotprod+i8mm) para el modelo de traducción, Sherpa-ONNX para ASR, QNN para las etapas NPU y Piper para TTS.
- No se declaran latencias ni throughput medidos.
- No se indica compatibilidad con vLLM, TGI ni Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vantuk/model_set_v73 | 1,8B (MT) + etapas auxiliares | 32k (MT) | Pipeline speech-to-speech on-device para Snapdragon 8 Gen 2 | Apache 2.0 | Hugging Face, 0 descargas |
| Whisper (variantes small/medium) | 244M–769M | 30 s de audio | ASR multilingüe | MIT | Ampliamente disponible |
| NLLB-200 distilled 1.3B | 1,3B | 512 tokens | Traducción multilingüe texto | CC-BY-NC 4.0 | Hugging Face |
| Piper (voces individuales) | <100M por voz | no aplica | TTS neuronal | MIT | Hugging Face / Rhasspy |

La comparación es aproximada: model_set_v73 no es un modelo único sino un paquete integrado, y no se dispone de métricas de calidad para contrastarlo con las alternativas citadas.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad (WER, BLEU, MOS) para ninguna de las etapas del pipeline.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (16 de noviembre de 2026), lo que sugiere ausencia de validación externa.
- El pipeline está atado a un SoC concreto (Snapdragon 8 Gen 2, Hexagon v73) y a QNN SDK 2.51.0; no es portable a otros aceleradores sin recompilar las etapas NPU.
- La cobertura lingüística se limita a vietnamita, inglés y coreano según la model card; no se declaran otros idiomas.
- El modelo de traducción se distribuye en Q4_0, cuantización agresiva que puede degradar la fidelidad en textos largos o dominios especializados.
- Riesgo de alucinación y de errores acumulados al encadenar LID, ASR, MT y TTS en serie.
- No se documentan sesgos, composición de datos de entrenamiento ni procedencia de los datasets de ASR y MT, lo que dificulta evaluar riesgos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar los componentes de terceros (SenseVoice, Piper, eSpeak-NG) por sus propias licencias.

## Enlaces

- Hugging Face: https://huggingface.co/Vantuk/model_set_v73
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
