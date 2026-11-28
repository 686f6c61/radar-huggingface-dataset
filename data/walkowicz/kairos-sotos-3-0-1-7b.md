# Walkowicz/kairos-sotos-3.0-1.7b

## Resumen

Kairos Sotos 3.0 1.7B es un ajuste fino (fine-tuning) del modelo base LiquidAI/LFM3-1.7B, desarrollado por el autor independiente Walkowicz. Está especializado en tareas de ciberseguridad defensiva y auditoría de privacidad, con un enfoque explícito en marcos como OWASP, CWE, GDPR y LGPD. El modelo se distribuye exclusivamente en formato GGUF y está pensado para su uso con Ollama y llama.cpp en hardware de consumo.

El modelo resuelve el problema de disponer de un auditor de seguridad y privacidad compacto, bilingüe (inglés y portugués de Brasil) y ejecutable en local, sin depender de APIs externas. Con 1.728.801.600 parámetros y un peso de 1,26 GB en cuantización Q5_K_M, está diseñado para entornos donde la confidencialidad del código y los datos es crítica, como auditorías de aplicaciones o revisiones de cumplimiento normativo.

Su relevancia radica en la combinación de tamaño reducido, velocidad de inferencia elevada (160,22 tok/s en una RTX 3060 según el autor) y un rendimiento declarado que, según la model card, supera a la versión anterior de 4B del mismo autor en su suite de evaluación de 25 casos y en una evaluación ciega de 200 casos. El modelo incluye un modo de razonamiento (``) y se distribuye con una licencia lfm1.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (configurado en el Modelfile de Ollama) |
| Tipos de cuantizacion | Q5_K_M (1,26 GB) y BF16 (3,47 GB) |
| Idiomas soportados | en, pt (portugués de Brasil; proporción 50/50 según el autor) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (Q5_K_M y BF16); existe una edición MLX separada |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El modelo deriva de LiquidAI/LFM3-1.7B, pero la model card no especifica si se trata de un transformer convencional, un modelo híbrido o una arquitectura SSM. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

El ajuste fino se realizó con Unsloth, según las etiquetas del repositorio. El modelo incorpora un modo de razonamiento explícito mediante etiquetas ``, y el Modelfile de Ollama fuerza el token `<|startoftext|>` junto con dicho bloque de pensamiento y un `num_ctx` de 8192. La model card menciona que el modelo fue evaluado con Promptfoo mediante un conjunto denominado KDS v1, pero no se describe la metodología de entrenamiento ni la composición de los datos de ajuste.

## Capacidades

- Generación de texto conversacional en inglés y portugués de Brasil, con proporción declarada 50/50 entre ambos idiomas.
- Auditoría de ciberseguridad defensiva: análisis orientado a OWASP, CWE y buenas prácticas de AppSec.
- Evaluación de privacidad y cumplimiento: referencias a GDPR y LGPD en el análisis de flujos de datos y tratamiento de información personal.
- Modo de razonamiento explícito mediante el bloque ``, que separa el proceso de pensamiento de la respuesta final.
- Soporte de conversaciones multi-turno con contexto de hasta 8192 tokens (según configuración de Ollama).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras modalidades.
- Capacidades multilingües limitadas a inglés y portugués; no se declara soporte de castellano.

## Casos de uso

- Auditoría de código en pipelines de CI/CD: el modelo puede revisar fragmentos de código en busca de patrones asociados a CWE y OWASP, integrándose como paso de análisis en un pipeline con llama.cpp u Ollama, gracias a su reducido tamaño y a su velocidad de inferencia declarada de 160,22 tok/s.
- Revisión de cumplimiento GDPR/LGPD: puede analizar descripciones de flujos de datos y tratamientos para señalar posibles incumplimientos en materia de privacidad, en inglés o portugués, adecuado para equipos de protección de datos que necesitan una primera pasada automatizada y local.
- Asistente de seguridad en local para desarrolladores: desplegado con Ollama en un portátil o estación de trabajo, permite consultar dudas sobre configuración segura, gestión de secretos o controles de acceso sin enviar código propietario a servicios externos.
- Triaje de hallazgos de escáneres: el modelo puede tomar la salida de herramientas SAST/DAST y generar explicaciones priorizadas en lenguaje natural, ayudando a equipos de AppSec a clasificar vulnerabilidades por criticidad y marco de referencia.
- Formación y concienciación en seguridad: puede generar explicaciones didácticas sobre clases de vulnerabilidad (CWE) y controles OWASP para materiales internos de formación, en inglés o portugués.
- Preprocesamiento de informes de auditoría: con 8192 tokens de contexto, puede resumir y estructurar documentos de auditoría o políticas de privacidad extensas en un formato manejable para revisión humana.
- Despliegue en entornos con requisitos de soberanía del dato: al ejecutarse íntegramente en local con un peso de 1,26 GB en Q5_K_M, encaja en escenarios donde la normativa impide el envío de información a la nube.

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

| Modelo | Parámetros | Tamaño | Throughput | Suite 25 casos (/250) | KDS v1 (/28) | Evaluación ciega (/200) | Promptfoo (/5) |
|---|---|---|---|---|---|---|---|
| Kairos Sotos 3.0 (Q5_K_M) | 1.7B | 1,26 GB | 160,22 tok/s | 249,0 / 250 | no disponible en el fragmento | 187 / 200 (93,5 %) | 5/5 |
| Kairos Sotos 2.0 (4B) | 4B | no disponible | 35,91 tok/s | no disponible | no disponible | 169 / 200 | no disponible |
| Kairos Sotos 3.0 (BF16) | 1.7B | 3,47 GB | no disponible | no disponible | 24/28 (85,7 %) | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con la cuantización Q5_K_M (1,26 GB de pesos más overhead de contexto); en torno a 4 GB con BF16 (3,47 GB de pesos).
- GPU recomendadas: el autor reporta 160,22 tok/s en una RTX 3060. Cualquier GPU consumer con 4 GB o más de VRAM debería poder ejecutar la variante Q5_K_M; una RTX 4090 o A100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en tarjetas con al menos 2 GB de VRAM para Q5_K_M (por ejemplo, GTX 1650, RTX 3050, RTX 3060) y en Apple Silicon mediante la edición MLX.
- Opciones de despliegue: Ollama (con los Modelfiles incluidos), llama.cpp y, presumiblemente, cualquier runtime compatible con GGUF. Existe una edición MLX para Apple Silicon.
- Latencia y throughput: 160,22 tok/s en RTX 3060 con Q5_K_M según el autor; 4,46 veces más rápido que la versión 4B (35,91 tok/s). No se dispone de datos de latencia (TTFT) ni de throughput en otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kairos Sotos 3.0 1.7B | 1,7B | 8192 | lfm1.0 | GGUF, MLX | Especializado en ciberseguridad y privacidad; bilingüe EN/PT |
| Kairos Sotos 2.0 4B | 4B | no disponible | no disponible | no disponible | Versión anterior del mismo autor; superada por la 3.0 en evaluación ciega (169 frente a 187 de 200) |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | lfm1.0 | safetensors | Modelo base sin especializar; sirve de referencia de arquitectura y licencia |

No se dispone de datos de benchmarks ni de especificaciones de contexto para los modelos comparables más allá de lo indicado. No se han identificado en la información proporcionada otros modelos especializados en ciberseguridad de tamaño similar para una comparación directa.

## Limitaciones y advertencias

- Los benchmarks proceden únicamente de la model card del autor, con conjuntos de evaluación propios (suite de 25 casos, KDS v1, evaluación ciega de 200 casos) y sin verificación independiente; deben interpretarse con cautela.
- El modelo solo declara soporte de inglés y portugués de Brasil; no se garantiza un rendimiento fiable en castellano u otros idiomas.
- Al ser un modelo de 1,7B especializado, es probable que tenga menor capacidad de razonamiento general y mayor riesgo de alucinación que modelos de mayor tamaño, especialmente fuera de su dominio de especialización.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo; como todo modelo de lenguaje, puede reproducir sesgos presentes en sus datos de entrenamiento.
- La licencia lfm1.0 (license: other) impone condiciones que deben revisarse antes de un uso comercial; la model card no detalla restricciones específicas más allá de enlazar al archivo LICENSE.
- El contexto está configurado en 8192 tokens en el Modelfile de Ollama; superar ese límite puede degradar la calidad de las respuestas.
- No se documenta soporte de tool calling ni de capacidades de agente, lo que limita su integración en flujos automatizados complejos sin capas adicionales.
- El repositorio solo contiene artefactos GGUF y Modelfiles; no se distribuyen pesos en safetensors dentro de este repositorio, aunque el tamaño del repo (4,7 GB) sugiere la presencia de otros archivos no listados en la model card.
- La fecha de creación del repositorio (2026-11-23) y la ausencia de likes y de documentación metodológica detallada aconsejan tratar las afirmaciones de rendimiento como no contrastadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Edición MLX para Apple Silicon: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b-mlx
- Pesos Q5_K_M: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b/resolve/main/kairos-sotos-3.0-1.7B.Q5_K_M.gguf
- Pesos BF16: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b/resolve/main/kairos-sotos-3.0-1.7B.BF16.gguf
- Modelfile Q5_K_M: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b/resolve/main/Modelfile.Q5_K_M
- Modelfile BF16: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b/resolve/main/Modelfile.BF16
- Licencia: https://huggingface.co/Walkowicz/kairos-sotos-3.0-1.7b/blob/main/LICENSE
