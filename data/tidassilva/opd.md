# TidasSilva/OPD

## Resumen

OPD-LLM es un modelo de lenguaje experimental de aproximadamente 1.235 millones de parámetros, desarrollado por TidasSilva y publicado en Hugging Face bajo el identificador `TidasSilva/OPD`. Se trata de un derivado afinado del modelo `unsloth/Llama-3.2-1B-Instruct`, orientado a la investigación en comprensión de lenguaje médico y a flujos experimentales de apoyo a la decisión en consulta ambulatoria (outpatient). El autor lo presenta explícitamente como un modelo de investigación, no como un sistema clínico validado.

El modelo se construye sobre la arquitectura transformer decoder-only de Llama 3.2 1B y se entrena en tres etapas: preentrenamiento continuado (CPT) sobre un corpus médico seleccionado, ajuste supervisado (SFT) sobre ejemplos estructurados de pregunta-respuesta médica y casos ambulatorios, y optimización por refuerzo con GRPO. El artefacto publicado es el modelo fusionado (merged), no un adaptador LoRA, aunque el entrenamiento se realizó con LoRA de rango 32 y alpha 64.

Su relevancia es limitada y de nicho: se trata de un experimento de investigación con métricas de desarrollo preliminares y un conjunto de evaluación pequeño que incluye ejemplos sintéticos. El propio autor advierte de fallos en la detección de señales de alarma (3 derivaciones de bandera roja no detectadas), lo que refuerza su carácter exclusivamente investigador y su no idoneidad para uso clínico real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.2 1B) |
| Parámetros totales | 1.235.814.400 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | other (licencia personalizada; el autor remite a la licencia del modelo base Llama 3.2) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 1B Instruct: un transformer decoder-only denso de aproximadamente 1.235 millones de parámetros, sin mezcla de expertos. El modelo parte de la versión ya ajustada por instrucciones de Unsloth y se somete a un pipeline de tres fases documentado por el autor. La primera fase es un preentrenamiento continuado (CPT) sobre un corpus de texto médico seleccionado, cuyo contenido y volumen de tokens no se detallan en la model card. La segunda es un ajuste supervisado (SFT) sobre ejemplos estructurados de pregunta-respuesta médica y casos ambulatorios. La tercera es una optimización por refuerzo con Group Relative Policy Optimization (GRPO), basada en recompensas.

Durante el entrenamiento se empleó LoRA con rango 32, alpha 64 y dropout 0,05, si bien el artefacto subido es el modelo fusionado, no un checkpoint de solo adaptador. El autor no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del esquema de recompensas de GRPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el modelo hereda la atención estándar de Llama 3.2.

## Capacidades

- Generación de texto en inglés con orientación a contenido médico y ambulatorio.
- Respuesta a preguntas de opción múltiple sobre conocimiento médico (con rendimiento bajo según la evaluación preliminar: 22,0 % de acierto).
- Clasificación orientativa de triaje en escenarios de consulta (95,0 % de acierto reportado en el conjunto de desarrollo).
- Coincidencia de diagnóstico en casos presentados (98,3 % reportado).
- Asociación síntoma-diagnóstico (80,0 % reportado).
- Conversación multi-turno básica heredada del modelo base Instruct.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta capacidad de visión, audio ni modo de razonamiento (thinking mode).
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación en comprensión de lenguaje médico: uso del modelo como objeto de estudio para analizar cómo el preentrenamiento continuado y el RL con GRPO afectan a la calidad de las respuestas en dominios especializados, comparando con el modelo base.
- Experimentación con pipelines de CPT + SFT + GRPO: reproducción del proceso de entrenamiento en entornos controlados para estudiar la contribución de cada etapa, tal como sugiere el apartado de reproducibilidad del autor.
- Generación de ejemplos sintéticos de pregunta-respuesta médica para aumentar datasets de investigación, siempre con revisión humana y sin datos de pacientes identificables.
- Evaluación de riesgos en modelos sanitarios: el modelo sirve como caso de estudio de fallos en la detección de señales de alarma (3 derivaciones no detectadas), útil para investigar métricas de seguridad clínica.
- Prototipado de interfaces conversacionales de educación sanitaria para profesionales, con revisión médica obligatoria y sin uso sobre pacientes reales.
- Estudio de sesgos y alucinaciones en modelos pequeños (1B) aplicados a dominios de alto riesgo, comparando su comportamiento con modelos mayores.
- Docencia e investigación académica sobre ajuste fino eficiente con LoRA y RL, dado el tamaño reducido del modelo y su despliegue asequible en hardware de consumo.

## Benchmarks y rendimiento

Resultados preliminares de desarrollo reportados por el autor (no validados de forma independiente; conjunto de evaluación limitado e incluyendo ejemplos sintéticos):

| Métrica | Resultado |
|---|---:|
| Precisión en preguntas de opción múltiple (MCQ) | 22,0 % |
| Precisión de triaje | 95,0 % |
| Coincidencia de diagnóstico en casos | 98,3 % |
| Precisión síntoma-diagnóstico | 80,0 % |
| Derivaciones de bandera roja no detectadas | 3 |
| Derivaciones excesivas (over-referrals) | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, en torno a 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,3-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,7-1,2 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente en fp16 o cuantizado; en entornos de servidor, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, con holgura, incluso en fp16 en tarjetas de 8 GB o más.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repo), endpoints compatibles; llama.cpp, Ollama o vLLM requerirían conversión a GGUF o configuración adicional no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TidasSilva/OPD | 1,235 B | No disponible | Médico experimental (CPT + SFT + GRPO) | other | Hugging Face |
| unsloth/Llama-3.2-1B-Instruct | 1,235 B | 128 K (según Llama 3.2) | Instrucciones generales | Llama 3.2 Community License | Hugging Face |
| Llama-3.2-1B-Instruct (Meta) | 1,235 B | 128 K | Instrucciones generales | Llama 3.2 Community License | Hugging Face, Meta |

La comparación con otros modelos médicos de tamaño similar no está disponible en la información proporcionada. El modelo base `unsloth/Llama-3.2-1B-Instruct` es la referencia directa más adecuada para comparaciones controladas, tal como recomienda el propio autor.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no debe usarse para diagnosticar, tratar ni triar a pacientes reales.
- No ha sido validado clínicamente; las métricas reportadas son preliminares y provienen de un conjunto de evaluación limitado con ejemplos sintéticos.
- El resultado de MCQ (22,0 %) indica un conocimiento médico factual muy limitado.
- Se detectaron 3 derivaciones de bandera roja no realizadas, lo que supone un riesgo de seguridad relevante en cualquier escenario clínico.
- Riesgo elevado de alucinación y de generar información médica incorrecta, incompleta o engañosa.
- Idiomas: solo inglés; no se documenta soporte de castellano ni de otras lenguas.
- Longitud de contexto no documentada en la model card; no debe asumirse la del modelo base sin verificación.
- Licencia "other": es necesario revisar la licencia del modelo base Llama 3.2 antes de redistribuir o publicar derivados; las restricciones comerciales no están claras en la información disponible.
- No se debe introducir información de pacientes identificable en las entradas.
- Los resultados de entrenamiento (LoRA rango 32, alpha 64, dropout 0,05) y el pipeline CPT/SFT/GRPO no están acompañados de hiperparámetros detallados ni de volúmenes de datos, lo que dificulta la reproducibilidad completa.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TidasSilva/OPD
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
