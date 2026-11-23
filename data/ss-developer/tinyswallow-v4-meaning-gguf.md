# Ss-developer/tinyswallow-v4-meaning-gguf

## Resumen

TinySwallow-v4-Meaning GGUF es un ajuste fino mediante LoRA del modelo SakanaAI/TinySwallow-1.5B-Instruct, especializado en la explicación del significado de expresiones y proverbios de la literatura clásica china (kanbun) en japonés. Lo publica el usuario Ss-developer y se distribuye como cuantización GGUF q4_K_M pensada para ejecución en navegador mediante transformers.js v3 o superior con WebGPU. El modelo resuelve un nicho muy concreto: asistencia educativa para el estudio de textos clásicos en japones, con instrucciones explícitas de abstenerse cuando no dispone de información fiable.

Con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones), se enmarca en la categoría de modelos pequeños optimizados para dispositivos de borde. Su relevancia actual radica en la combinación de tres factores: un tamaño que permite inferencia local sin GPU dedicada, un empaquetado GGUF listo para el navegador y una licencia Apache-2.0 sin restricciones para uso comercial. El repositorio ocupa 1,0 GB y no registra descargas ni interacciones en el momento de la consulta.

Se trata de un modelo de propósito muy específico, no de un asistente generalista: su entrenamiento adicional se centra en un dominio filológico y su idioma de trabajo declarado es únicamente el japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2, según el tag `qwen2` del repositorio) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q4_K_M (única variante publicada) |
| Idiomas soportados | japonés (`ja`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`model-q4_k_m.gguf`); biblioteca declarada: transformers.js |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base SakanaAI/TinySwallow-1.5B-Instruct, un transformer decoder-only de la familia Qwen2 con aproximadamente 1,5 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA para la tarea de explicación del significado de expresiones y proverbios de la literatura clásica china (kanbun). No se especifican en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste LoRA.

El único dato cuantitativo de entrenamiento publicado es el resultado de una evaluación de desarrollo sobre 25 preguntas en el paso 240 (step-240): 10 respuestas consideradas correctas (OK), 6 parciales (PARTIAL), 9 mixtas (MIX), 0 rechazos (REFUSE) y 0 respuestas en caracteres incorrectos (CHAR). El modelo incorpora un system prompt que instruye al asistente a responder de forma concisa y estructurada, y a declarar explícitamente la falta de información cuando no pueda verificar el contenido, evitando inventar o mezclar relatos. La distribución se realiza como GGUF q4_K_M, un formato orientado a inferencia eficiente en CPU y WebGPU.

## Capacidades

- Generación de texto conversacional en japonés, orientada a la explicación del significado de expresiones y proverbios de la literatura clásica china.
- Explicación estructurada y concisa de pasajes kanbun, incluyendo el sentido de la expresión y su contexto de uso.
- Comportamiento de abstención: el system prompt instruye a responder "この故事・語句については十分な情報がありません。" cuando el contenido no es verificable, lo que reduce el riesgo de invención en un dominio propenso a la fabulación.
- Ejecución en navegador mediante transformers.js v3 o superior con WebGPU y selección explícita del archivo `model-q4_k_m.gguf`.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite su despliegue tras una API compatible con el ecosistema de Hugging Face.
- No dispone de capacidades declaradas de tool calling, function calling, razonamiento multi-paso orientado a agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al japonés; no se declara soporte de otros idiomas.

## Casos de uso

- Asistencia educativa en el aula de japonés clásico: el modelo puede explicar el significado de proverbios y expresiones kanbun a estudiantes, con respuestas breves y estructuradas que encajan en el ritmo de una clase o un ejercicio autoguiado.
- Aplicación web de estudio sin backend: al ejecutarse en el navegador con transformers.js y WebGPU, permite ofrecer un asistente de consulta de kanbun sin enviar el texto del usuario a un servidor, lo que simplifica el cumplimiento de privacidad y elimina costes de inferencia en la nube.
- Herramienta de consulta offline para investigadores y filólogos: el empaquetado GGUF de 1,0 GB puede distribuirse en un portátil o en una memoria USB y ejecutarse en local para consultas rápidas sobre expresiones concretas.
- Generación de material didáctico de apoyo: el modelo puede producir borradores de explicaciones para fichas de vocabulario o notas de estudio que un docente revisa y corrige después, aprovechando su formato de respuesta conciso.
- Filtro de abstención en pipelines de contenido educativo: su comportamiento entrenado para rechazar contenidos no verificables lo hace útil como primera pasada que marca expresiones que requieren revisión humana antes de publicarse.
- Integración en extensiones de navegador o entornos de documentación: mediante endpoints compatibles o llamadas directas desde JavaScript, puede incorporarse a un panel lateral que ofrezca explicaciones contextuales mientras el usuario lee un texto clásico.
- Prototipado rápido de asistentes de nicho: sirve como base para experimentar con ajustes LoRA adicionales en dominios filológicos, dado su tamaño reducido y su licencia permisiva.

## Benchmarks y rendimiento

El autor publica únicamente una evaluación interna de desarrollo, no comparable con benchmarks estándar:

| Evaluación | Conjunto | Resultado |
|---|---|---|
| OK (respuesta correcta) | dev, 25 preguntas, step-240 | 10 / 25 |
| PARTIAL (parcialmente correcta) | dev, 25 preguntas, step-240 | 6 / 25 |
| MIX (mezcla de aciertos y errores) | dev, 25 preguntas, step-240 | 9 / 25 |
| REFUSE (abstención) | dev, 25 preguntas, step-240 | 0 / 25 |
| CHAR (error de caracteres) | dev, 25 preguntas, step-240 | 0 / 25 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización q4_K_M, el archivo de pesos ronda 1 GB, por lo que la inferencia requiere aproximadamente 1,5-2 GB de memoria, incluyendo overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU en el navegador; en servidor, tarjetas de gama baja como T4 o L4 son suficientes y sobradas. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1650 en adelante, RTX 3050/4060, Apple Silicon con Metal) y también en CPU, dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers.js v3 o superior con WebGPU (vía de referencia del autor), llama.cpp, Ollama y servidores compatibles con GGUF como llama-cpp-python o TGI con soporte GGUF. vLLM no soporta GGUF de forma nativa en todas sus versiones, por lo que su uso requeriría convertir los pesos.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinySwallow-v4-Meaning GGUF | ~1,5 B | no disponible | Kanbun y clásicos chinos en japonés | Apache-2.0 | GGUF en Hugging Face |
| SakanaAI/TinySwallow-1.5B-Instruct | ~1,5 B | no disponible | Asistente generalista en japonés | Apache-2.0 | Pesos originales en Hugging Face |
| Qwen2-1.5B-Instruct | ~1,5 B | 32.768 tokens (según la familia Qwen2) | Asistente generalista multilingüe | Apache-2.0 | Pesos y múltiples cuantizaciones |

La comparación con el modelo base es la más directa: TinySwallow-v4-Meaning hereda su arquitectura y añade un ajuste LoRA de dominio, a costa de perder generalidad y de limitarse al japonés. Frente a Qwen2-1.5B-Instruct, el modelo especializado ofrece un comportamiento de abstención entrenado para su dominio, pero carece de la cobertura multilingüe y del contexto largo declarado por la familia Qwen2. No se dispone de datos de benchmarks comparativos que permitan establecer diferencias de rendimiento objetivas entre estas alternativas.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste LoRA se centra en la explicación de proverbios y expresiones kanbun; fuera de ese ámbito el rendimiento puede degradarse respecto al modelo base.
- Idioma único: solo se declara japonés; no hay soporte verificado de castellano ni de otros idiomas.
- Riesgo de alucinación: aunque el system prompt y el entrenamiento fomentan la abstención, la evaluación interna muestra 9 respuestas mixtas sobre 25, lo que indica que la fabulación parcial sigue siendo frecuente. En el conjunto de desarrollo no se produjo ninguna abstención (REFUSE 0), lo que sugiere que el modelo tiende a responder incluso cuando debería rechazar.
- Calidad limitada por el tamaño: con ~1,5 B de parámetros, la profundidad de razonamiento y la fidelidad filológica son acotadas; requiere revisión humana en contextos educativos o de investigación.
- Longitud de contexto no documentada: se desconoce la ventana efectiva, lo que impide planificar su uso con pasajes largos sin validación previa.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso comunitario ni informes independientes de calidad.
- Licencia Apache-2.0: permisiva para uso comercial, pero el autor no ofrece garantías sobre la exactitud del contenido generado; la responsabilidad sobre el uso educativo recae en el integrador.
- Dependencia de WebGPU para la vía de navegador: la ejecución en cliente requiere un navegador con soporte WebGPU, lo que excluye entornos antiguos o con aceleración deshabilitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ss-developer/tinyswallow-v4-meaning-gguf
- Modelo base: https://huggingface.co/SakanaAI/TinySwallow-1.5B-Instruct
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- CDN de transformers.js v3 citado en la model card: https://cdn.jsdelivr.net/npm/@huggingface/transformers@3
- Repositorio de llama.cpp (soporte GGUF): https://github.com/ggml-org/llama.cpp
- Repositorio de Ollama: https://github.com/ollama/ollama
