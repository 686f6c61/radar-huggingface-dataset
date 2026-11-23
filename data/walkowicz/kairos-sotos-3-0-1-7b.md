# Walkowicz/kairos-sotos-3.0-1.7b

## Resumen

Kairos Sotos 3.0 1.7B es un ajuste fino (fine-tuning) especializado en ciberseguridad defensiva y auditoría de privacidad, desarrollado por el usuario Walkowicz a partir del modelo base LiquidAI/LFM3-1.7B. El modelo está orientado a tareas de AppSec, cumplimiento normativo (GDPR y LGPD) y detección de vulnerabilidades alineadas con OWASP y CWE, con soporte bilingüe inglés y portugués de Brasil en una proporción declarada 50/50.

La propuesta del autor es ofrecer un auditor de seguridad compacto que supere en su suite de evaluación propietaria a la versión anterior de la familia (Kairos Sotos 2.0, de 4B parámetros), manteniendo un tamaño reducido de 1,7B parámetros y un binario cuantizado Q5_K_M de 1,26 GB. Según la model card, el modelo alcanza 249,0/250 en su suite de 25 casos, 187/200 (93,5%) en una evaluación ciega y 160,22 tok/s en una RTX 3060.

La relevancia actual del modelo radica en su enfoque de despliegue local y ligero para auditoría de seguridad, con distribución en formato GGUF y soporte para Ollama, además de una edición MLX para Apple Silicon. No obstante, las métricas presentadas proceden exclusivamente de evaluaciones internas del autor y no de benchmarks estándar de la comunidad, lo que limita la comparabilidad objetiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LiquidAI/LFM3-1.7B; la model card no detalla la arquitectura interna) |
| Parámetros totales | 1.728.801.600 (1,7B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (según `num_ctx 8192` del Modelfile.Q5_K_M) |
| Tipos de cuantización | Q5_K_M (1,26 GB) y BF16 (3,47 GB) |
| Idiomas soportados | en, pt (portugués de Brasil, proporción declarada 50/50) |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (Q5_K_M y BF16); edición MLX separada |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo base LiquidAI/LFM3-1.7B ni sobre la composición del dataset de ajuste fino. El autor indica que el entrenamiento se realizó con Unsloth (etiqueta `unsloth`), pero no especifica el número de tokens de entrenamiento, la mezcla de datos ni si se aplicaron técnicas de RLHF o DPO.

La especialización declarada se centra en ciberseguridad defensiva, AppSec y privacidad, con referencias explícitas a OWASP, CWE, GDPR y LGPD. El modelo incorpora un modo de razonamiento delimitado por etiquetas `<think></think>`, forzado mediante el Modelfile de Ollama, y utiliza el token especial `<|startoftext|>`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto orientada a análisis de seguridad defensiva y auditoría de privacidad.
- Identificación de vulnerabilidades y debilidades alineadas con catálogos OWASP y CWE.
- Evaluación de cumplimiento normativo en materia de protección de datos (GDPR y LGPD).
- Modo de razonamiento explícito mediante etiquetas `<think></think>`.
- Soporte bilingüe inglés y portugués de Brasil.
- Formato conversacional (`conversational`) y compatibilidad con endpoints.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras capacidades multimodales.

## Casos de uso

- Revisión de código en pipelines de CI/CD: el modelo puede analizar fragmentos de código y señalar patrones asociados a CWE y OWASP, integrándose como paso de pre-commit o revisión automatizada gracias a su reducido tamaño y despliegue en GGUF.
- Auditoría de políticas de privacidad: con contexto de 8192 tokens, permite procesar documentos de política de datos y contrastarlos con requisitos de GDPR o LGPD en inglés y portugués.
- Asistencia a equipos de AppSec: como chatbot local que responde consultas sobre mitigaciones y clasificación de vulnerabilidades, sin enviar datos sensibles a servicios externos.
- Formación y concienciación en seguridad: generación de explicaciones didácticas sobre riesgos y buenas prácticas para desarrolladores, en un entorno de ejecución local.
- Triaje inicial de hallazgos de escáneres: el modelo puede clasificar y priorizar alertas de herramientas SAST/DAST, ayudando a filtrar falsos positivos antes de la revisión humana.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local con Ollama o llama.cpp, es adecuado para organizaciones que no pueden enviar código o datos a APIs en la nube.
- Evaluación de cumplimiento en equipos lusófonos: el soporte nativo de portugués de Brasil facilita auditorías de privacidad en mercados donde la LGPD es aplicable.

## Benchmarks y rendimiento

Los datos disponibles proceden exclusivamente de evaluaciones internas del autor, no de benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K, etc.).

| Modelo | Parámetros | Tamaño | Throughput | Suite 25 (/250) | KDS v1 (/28) | Evaluación ciega (/200) | Promptfoo (/5) |
|---|---|---|---|---|---|---|---|
| Kairos Sotos 3.0 (Q5_K_M) | 1,7B | 1,26 GB | 160,22 tok/s | 249,0/250 | 23/28 (82,1%) | 187/200 (93,5%) | 5/5 |
| Kairos Sotos 3.0 (BF16) | 1,7B | 3,47 GB | 79,85 tok/s | 247,0/250 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

El autor indica que el modelo supera a Kairos Sotos 2.0 (4B) en la suite de 25 casos y en la evaluación ciega (187/200 frente a 169/200), y que es 4,46 veces más rápido en RTX 3060 (160,22 frente a 35,91 tok/s). Estas cifras no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,5 GB con Q5_K_M y en torno a 3,5-4 GB con BF16, sin contar el contexto.
- GPU recomendadas: RTX 3060 (medición del autor a 160,22 tok/s con Q5_K_M), así como cualquier GPU consumer con 4 GB o más de VRAM para Q5_K_M.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más de VRAM para Q5_K_M; para BF16 se recomienda 6-8 GB.
- Opciones de despliegue: Ollama (Modelfiles incluidos), llama.cpp (formato GGUF) y MLX en Apple Silicon mediante la edición separada.
- Latencia y throughput: 160,22 tok/s con Q5_K_M y 79,85 tok/s con BF16 en RTX 3060, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kairos Sotos 3.0 1.7B | 1,7B | 8192 | lfm1.0 | GGUF y MLX en Hugging Face | Especializado en ciberseguridad y privacidad; métricas internas del autor |
| Kairos Sotos 2.0 4B | 4B | no disponible | no disponible | Referenciado en la model card | Versión anterior de la familia; superado según el autor en su suite y evaluación ciega |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | lfm1.0 | Hugging Face | Modelo base generalista del que deriva este ajuste |

No se dispone de datos verificables de benchmarks estándar que permitan comparar este modelo con alternativas generalistas de tamaño similar.

## Limitaciones y advertencias

- Las métricas de rendimiento proceden de suites internas del autor (25 casos, evaluación ciega de 200, KDS v1 y Promptfoo) y no de benchmarks estándar, por lo que no son directamente comparables con otros modelos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación independiente por parte de la comunidad.
- Riesgo de alucinación inherente a un modelo de 1,7B: puede generar referencias incorrectas a CWE, OWASP o artículos normativos; requiere verificación humana en contextos de auditoría.
- Cobertura lingüística limitada a inglés y portugués de Brasil; no se declara soporte de castellano.
- Contexto de 8192 tokens, adecuado para fragmentos de código y documentos cortos, pero insuficiente para auditorías de repositorios completos en una sola pasada.
- Licencia lfm1.0 (etiquetada como `other`): es necesario revisar los términos del archivo LICENSE antes de un uso comercial, ya que puede incluir restricciones específicas.
- Especialización estrecha: su rendimiento en tareas generales de generación de texto, matemáticas o código fuera del ámbito de seguridad no está documentado y previsiblemente sea inferior al del modelo base.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su integración en flujos automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b
- Edición MLX para Apple Silicon: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b-mlx
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Pesos Q5_K_M: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b/resolve/main/kairos-sotos-3.0-1.7B.Q5_K_M.gguf
- Pesos BF16: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b/resolve/main/kairos-sotos-3.0-1.7B.BF16.gguf
- Modelfile Q5_K_M: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b/resolve/main/Modelfile.Q5_K_M
- Modelfile BF16: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b/resolve/main/Modelfile.BF16
