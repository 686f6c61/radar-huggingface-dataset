# UEC-InabaLab/CounselTrajLM-Qwen3-8B

## Resumen

CounselTrajLM-Qwen3-8B es un modelo de generación de texto especializado en diálogo de consejería psicológica en chino, desarrollado por el laboratorio UEC-InabaLab (Universidad de Electro-Comunicaciones, Japón). El modelo toma un historial de conversación entre cliente y consejero y genera la siguiente respuesta del consejero. Se construye mediante un ajuste fino QLoRA sobre Qwen3-8B, con el adaptador fusionado en los pesos BF16 del modelo base.

El modelo resuelve un problema concreto: la generación de respuestas de consejero coherentes con el contexto conversacional en chino, entrenado sobre CounselTrajD, un corpus sintético de 10.964 diálogos de consejería. Es relevante para investigación en generación de diálogo terapéutico y como componente del sistema CounselTraj, que incluye un planificador de trayectorias separado.

Arquitectura transformer decoder-only heredada de Qwen3-8B, con 8.190.735.360 parámetros totales y pesos en safetensors BF16 (16,4 GB en nueve shards). La inferencia se realiza en modo no-thinking (`enable_thinking=False`). Licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencia máxima de 2.048 tokens; historial truncado a 1.800 caracteres) |
| Tipos de cuantizacion | no disponible (release en BF16; el ajuste se hizo con QLoRA, pero no se publican GGUF ni otras cuantizaciones) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 9 shards, ~16,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B (revisión `b968826d9c46dd6066d109eabc6255188de91218`), un transformer decoder-only de 8.190.735.360 parámetros. El ajuste fino se realizó con QLoRA: rango LoRA 32, alpha 64, dropout 0,05, learning rate 0,0002, schedule coseno con warmup ratio 0,06, 3 épocas, batch efectivo 16 y longitud máxima de secuencia de 2.048 tokens. El adaptador se fusionó en el modelo base BF16 no cuantizado para el release. El export final corresponde a la última época, tras 79.815 pasos de optimizador.

Los datos de entrenamiento proceden de CounselTrajD: 10.964 diálogos sintéticos de consejería en chino, expandidos a partir de SmileChat (SMILE), PsyDTCorpus (PsyDT) y CPsyCounD (CPsyCoun). El split es dialogue-disjoint 90/10, con 425.679 ejemplos de entrenamiento y 47.528 de validación de tipo next-response. El historial de entrada se trunca a los últimos 1.800 caracteres. El modo thinking está desactivado tanto en entrenamiento como en inferencia.

## Capacidades

- Generación de la siguiente respuesta de consejero en diálogos de consejería psicológica en chino, a partir de un historial con prefijos `client:` y `counselor:`.
- Generación de texto condicionada por historial conversacional multi-turno (hasta 1.800 caracteres de historial).
- Formato de prompt específico con instrucción de sistema de consejero y chat template de Qwen3.
- Inferencia en modo no-thinking (sin cadena de razonamiento explícita).
- Script de inferencia incluido (`generate_reply.py`) con soporte de entrada JSONL y salida JSON.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni matemáticas avanzadas en la información disponible.
- Multilingüismo: únicamente chino declarado.

## Casos de uso

- Investigación en generación de diálogo terapéutico: el modelo sirve como baseline reproducible para estudiar la calidad y seguridad de respuestas de consejero generadas automáticamente en chino, con datos y prompts de evaluación publicados en el repositorio CounselTraj.
- Componente de generación en el sistema CounselTraj: se combina con el planificador de trayectorias (CounselTraj) que decide la trayectoria de actos de diálogo; este modelo produce la respuesta final del consejero condicionada al historial.
- Simulación de clientes o consejeros en entornos de entrenamiento: permite generar turnos de consejero realistas sobre historiales sintéticos para construir datasets de diálogo o evaluar otros modelos.
- Estudio de ajuste fino eficiente: el pipeline QLoRA documentado (rango, alpha, épocas, split) sirve de referencia para replicar el ajuste sobre otros corpus de consejería.
- Evaluación de seguridad en dominios sensibles: útil para analizar cómo un LLM de 8B responde en contextos de salud mental y detectar respuestas inapropiadas o inseguras antes de cualquier uso supervisado.
- Prototipado de interfaces de apoyo a la consejería: en un entorno de investigación controlado, para generar borradores de respuesta que un profesional revisaría, nunca como sustituto de atención clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos completos en BF16: ~16,4 GB, más memoria adicional para el contexto y el estado de inferencia. Se requiere una GPU con al menos ~20-24 GB de VRAM para cargar el modelo en BF16 con margen.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16. En GPUs consumer de 16 GB no cabe en BF16 sin cuantización, y no se publican pesos cuantizados.
- Despliegue: el modelo se carga directamente con Transformers (verificado con Transformers 5.13.0, PyTorch 2.5.1, Accelerate 1.13.0, safetensors 0.8.0). La model card no documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI, aunque los tags incluyen `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| CounselTrajLM-Qwen3-8B | 8.190.735.360 | no disponible (entrenamiento 2.048 tokens) | zh | Apache-2.0 | Ajuste QLoRA especializado en consejería; sin benchmarks publicados |
| Qwen/Qwen3-8B (base) | ~8,2 B | no disponible en esta ficha | multilingüe | Apache-2.0 | Modelo generalista del que deriva; capacidades de consejería no especializadas |
| CounselTraj (planificador) | no disponible | no disponible | zh | no disponible | Mismo proyecto; planifica trayectorias de actos de diálogo, no genera respuestas finales |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo no es un sustituto de atención profesional en salud mental; sus respuestas pueden ser inexactas, inapropiadas o inseguras.
- Los datos de entrenamiento son sintéticos (10.964 diálogos expandidos de tres corpus), lo que puede introducir artefactos y sesgos de los generadores utilizados.
- Solo soporta chino; no se declara ni evalúa rendimiento en otros idiomas.
- El historial se trunca a 1.800 caracteres, lo que limita el contexto efectivo de conversaciones largas.
- No se han publicado resultados de benchmarks ni evaluaciones clínicas en la información disponible.
- Aunque la licencia del modelo es Apache-2.0, los datos de origen (SMILE, PsyDT, CPsyCoun) tienen términos específicos recogidos en `LICENSING.md` y `THIRD_PARTY_NOTICES.md`; conviene revisarlos antes de uso comercial.
- Riesgo de alucinación y de respuestas clínicamente inadecuadas en contextos de crisis; requiere supervisión humana en cualquier despliegue real.
- El modo thinking está desactivado, por lo que no se aprovechan capacidades de razonamiento extendido del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UEC-InabaLab/CounselTrajLM-Qwen3-8B
- Paper (arXiv): https://arxiv.org/abs/2611.24168
- Repositorio del proyecto CounselTraj: https://github.com/UEC-InabaLab/CounselTraj
- Planificador CounselTraj: https://huggingface.co/UEC-InabaLab/CounselTraj
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencias y términos de datos: https://github.com/UEC-InabaLab/CounselTraj/blob/master/LICENSING.md
- Avisos de terceros: https://github.com/UEC-InabaLab/CounselTraj/blob/master/THIRD_PARTY_NOTICES.md
- SMILE (SmileChat): https://aclanthology.org/2024.findings-emnlp.34/
- PsyDT (PsyDTCorpus): https://aclanthology.org/2025.acl-long.55/
- CPsyCoun (CPsyCounD): https://aclanthology.org/2024.findings-acl.830/
