# sulabhkatiyar/sravaani-p2-k1

## Resumen

SraVaani P2-K1 es un ajuste fino piloto del modelo de reconocimiento automático del habla (ASR) SraVaani-1.0, desarrollado por sulabhkatiyar. Se trata de un modelo híbrido TDT-CTC basado en la arquitectura FastConformer, con aproximadamente 449 millones de parámetros, entrenado con NeMo 2.4.0 y un tokenizador SPM de 5000 unidades. Su propósito es extender las capacidades del modelo base hacia el inglés manteniendo la cobertura de lenguas índicas, mediante un ajuste fino completo sobre un corpus de 2.787 horas procedente de 78 fuentes, con una proporción de replay de datos índicos igual o superior al 60%.

La relevancia de este artefacto es fundamentalmente metodológica: el autor lo describe explícitamente como una ejecución de referencia para una posterior ejecución en AMD MI300X, no como un lanzamiento de producción. El entrenamiento se realizó en 2 GPU T4 de Kaggle (por tanto, 32 GB de VRAM en total) con precisión fp16 y GradScaler, learning rate de 1e-5, decaimiento de learning rate por capas (LLRD) de 0.9 y BatchNorm congelado. El plan de ejecución contemplaba 15.742 pasos máximos, con evaluaciones cada 1.300 pasos y guardado cada 1.050 pasos, aunque los campos de pasos completados y condición de parada figuran como no disponibles en la model card.

El modelo se distribuye bajo licencia MIT y el repositorio ocupa 11,1 GB, lo que incluye pesos en fp32, un paquete de paridad entre hardware, trazas, logs por paso y resultados de evaluación final. No se han publicado resultados de benchmarks ni especificaciones de rendimiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrida TDT-CTC (NeMo) |
| Parametros totales | ~449 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32) |
| Idiomas soportados | índicas e inglés (según tags y model card; lista concreta no disponible) |
| Licencia | MIT |
| Formato de pesos | state_dict de PyTorch (`.pt`, fp32); modelo base en `.nemo` |

## Arquitectura y entrenamiento

La arquitectura es una FastConformer híbrida que combina dos cabeceras de decodificación: TDT (Token-and-Duration Transducer) y CTC, ambas entrenadas simultáneamente con sus respectivas funciones de pérdida. El modelo parte de SraVaani-1.0 y emplea un tokenizador SentencePiece de 5000 unidades. El ajuste fino es completo (no LoRA ni adaptadores), con BatchNorm congelado y decaimiento de learning rate por capas de 0.9, una configuración típica para estabilizar el ajuste de modelos convolucionales profundos.

Los datos de entrenamiento provienen del dataset `sulabhkatiyar/sravaani-train-v1` en la revisión `abc`: 78 fuentes que suman 2.787 horas, con una proporción de replay de datos índicos igual o superior al 60% para mitigar el olvido catastrófico de las lenguas originales al introducir inglés. El entrenamiento se ejecutó en 2 GPU T4 con fp16 y GradScaler inicializado a 1024, learning rate de 1e-5 y el plan de 15.742 pasos máximos mencionado. El paquete `parity/` incluido en el repositorio contiene lotes exactos de las primeras iteraciones por rango, trazas y pérdidas de sonda en modo evaluación, pensados para verificar la reproducibilidad entre el hardware de referencia (T4) y el hardware objetivo (MI300X).

## Capacidades

- Reconocimiento automático del habla (ASR) en lenguas índicas e inglés, heredado del modelo base SraVaani-1.0 y del ajuste fino piloto.
- Decodificación híbrida TDT y CTC, lo que permite elegir entre un decodificador transducer (con modelado de duración de tokens) y uno CTC según los requisitos de latencia y precisión.
- Procesamiento de audio con tokenizador subword SPM-5000, adecuado para vocabularios multilingües índicos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente ASR.
- No se documentan capacidades de visión, audio generativo ni modo de razonamiento extendido.
- Capacidades multilingües limitadas a los idiomas cubiertos por el corpus de entrenamiento; la lista exacta no está disponible.

## Casos de uso

- Transcripción de audio en lenguas índicas: el modelo puede transcribir reuniones, entrevistas o contenido audiovisual en hindi, tamil, telugu y otras lenguas del subcontinente, apoyándose en el decodificador TDT para una alineación temporal precisa.
- Subtitulado automático de vídeo multilingüe: la combinación de TDT y CTC permite generar transcripciones con marcas temporales, útil para plataformas de contenido que operan en India y diáspora.
- Asistentes de voz para atención al cliente: integrado en un pipeline ASR + NLU, el modelo transcribe consultas de usuarios en inglés e índico, aunque su ventana de contexto no está documentada y debe validarse empíricamente para audio largo.
- Documentación clínica dictada: transcripción de notas médicas en entornos donde el personal alterna inglés e idiomas locales, reduciendo el esfuerzo de transcripción manual.
- Búsqueda por voz en catálogos y bases de conocimiento: indexación de audio mediante transcripción previa, con la ventaja de un modelo de 449 M parámetros que puede desplegarse en infraestructura modesta.
- Investigación en ASR multilingüe: el paquete de paridad entre hardware y los logs por paso lo convierten en un punto de partida reproducible para estudiar el ajuste fino de FastConformer en distintas GPU, incluida la migración a MI300X.
- Evaluación de olvido catastrófico: el diseño con replay índico superior al 60% permite estudiar cómo se preserva el rendimiento en lenguas originales al añadir inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 449 M parámetros en fp32, los pesos ocupan aproximadamente 1,8 GB; en fp16, unos 0,9 GB. El repositorio de 11,1 GB incluye pesos, logs y paquetes de paridad, no solo el modelo.
- GPU recomendadas: el entrenamiento de referencia se ejecutó en 2 GPU T4 (16 GB cada una); para inferencia basta una GPU consumer con 8 GB o más, como RTX 3060, RTX 4060 o RTX 4090.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del modelo.
- Opciones de despliegue: NeMo 2.4.0 es el entorno nativo; el flujo documentado consiste en restaurar el `.nemo` de SraVaani-1.0 y cargar el state_dict con `model.load_state_dict(torch.load(path))`. No se documentan exportaciones a ONNX, TensorRT ni GGUF.
- Latencia y throughput estimados: no disponibles. El plan de ejecución menciona un sondeo de 0,85 s por paso en el hardware de referencia, pero no equivale a latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SraVaani P2-K1 | ~449 M | no disponible | índicas e inglés | MIT | Hugging Face |
| Whisper large-v3 (OpenAI) | ~1.550 M | 30 s de audio | multilingüe amplio | MIT | Hugging Face, amplia adopción |
| Whisper small (OpenAI) | ~244 M | 30 s de audio | multilingüe amplio | MIT | Hugging Face |
| NVIDIA Parakeet TDT (NeMo) | ~600 M | no disponible | inglés principalmente | CC-BY-4.0 | NGC, Hugging Face |

La comparación con Whisper es la más directa en términos de licencia permisiva y despliegue en GPU consumer; SraVaani P2-K1 se diferencia por su enfoque explícito en lenguas índicas y por la decodificación híbrida TDT-CTC. Frente a Parakeet, comparte familia arquitectónica (FastConformer + TDT) pero cubre un espectro lingüístico distinto. No se dispone de métricas comparativas de WER en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que se trata de un piloto corto y no de un lanzamiento: no debe asumirse calidad de producción.
- No se han publicado métricas de WER ni evaluaciones comparativas, por lo que el rendimiento real es desconocido.
- La lista exacta de idiomas soportados no está disponible; solo se indican índicas e inglés de forma genérica.
- Riesgo de olvido catastrófico parcial en lenguas índicas pese al replay superior al 60%, especialmente en las de menor representación en el corpus.
- Sesgos desconocidos: no se documenta la composición demográfica ni la distribución por género, acento o dialecto del corpus de 78 fuentes.
- Riesgo de alucinación en transcripciones con audio ruidoso o acentos no representados, inherente a los modelos ASR transducer.
- La licencia MIT permite uso comercial, pero la procedencia y las licencias de las 78 fuentes del dataset de entrenamiento no se detallan, lo que conviene verificar antes de un despliegue comercial.
- El formato de pesos es un state_dict fp32 que requiere restaurar el `.nemo` base con NeMo 2.4.0; no hay artefactos listos para servir en vLLM, llama.cpp u Ollama.
- La model card contiene campos incompletos (pasos completados, condición de parada, commit de Git), lo que dificulta la reproducibilidad exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/sravaani-p2-k1
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/sulabhkatiyar/sravaani-train-v1
- NeMo (framework de entrenamiento y despliegue): https://github.com/NVIDIA/NeMo
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html
- Paper de FastConformer: https://arxiv.org/abs/2305.05084
