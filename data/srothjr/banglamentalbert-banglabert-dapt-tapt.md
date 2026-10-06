# SrothJr/banglamentalBERT-banglaBERT-dapt-tapt

## Resumen

banglamentalBERT-banglaBERT-dapt-tapt es un clasificador de texto en bengalí (bn) especializado en detectar severidad de depresión en publicaciones de redes sociales. Lo desarrolla SrothJr como parte de la tesis *Detecting Mental Health and Suicidal Tendencies on Social Media using Multimodal NLP* del Departamento de CSE de la BRAC University, y se apoya en BanglaBERT (csebuetnlp/banglabert), un modelo de arquitectura ELECTRA con 110 millones de parámetros.

El modelo resuelve un problema de clasificación de cuatro clases: mínimo, leve, moderado (ideación pasiva) y severo (ideación suicida activa). Su relevancia radica en un pipeline de entrenamiento en tres etapas (DAPT, TAPT y fine-tuning) que logra un F1 ponderado del 87,20% sobre un conjunto de test de 738 publicaciones originales, con especial atención a la clase minoritaria de ideación moderada.

La innovación principal del trabajo es metodológica: los datos sintéticos se emplean únicamente en la etapa de TAPT para aprendizaje no supervisado de vocabulario, no como etiquetas de entrenamiento. El autor documenta que alimentar etiquetas sintéticas directamente al fine-tuning degradaba todos los modelos entre un 1,71% y un 3,44% en F1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (base: BanglaBERT), encoder transformer para clasificacion de secuencias |
| Parametros totales | 110.620.420 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Bengalí (bn) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Numero de clases | 4 (Minimum, Mild, Moderate, Severe) |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es BanglaBERT, un modelo ELECTRA de 110M parámetros preentrenado para bengalí. Sobre esa base se aplica un pipeline de tres etapas. La primera, DAPT (Domain-Adaptive Pretraining), realiza modelado de lenguaje enmascarado (MLM) sobre 250.154 publicaciones de salud mental en bengalí, traducidas desde 15 subreddits de salud mental en inglés mediante NLLB-200-3.3B. La segunda, TAPT (Task-Adaptive Pretraining), continúa el MLM sobre 17.131 publicaciones sintéticas de salud mental en bengalí generadas por Qwen3-32B, condicionadas por etiqueta y cubriendo los cuatro niveles de severidad. La tercera etapa es el fine-tuning para clasificación, realizado exclusivamente con 3.426 publicaciones reales anotadas, sin etiquetas sintéticas.

Los hiperparámetros documentados son: longitud máxima de secuencia 256, learning rate 2e-5, batch efectivo 16, weight decay 0,01, 500 pasos de warmup, parada temprana con paciencia 3 sobre F1 de validación, FP16 activado y semilla 42. La probabilidad de enmascaramiento en TAPT fue 0,15. El conjunto de datos procede del dataset de severidad de depresión en bengalí de Kabir et al. (4.898 muestras), con partición estratificada 70-15-15 (3.426 entrenamiento, 733 validación, 738 test). El conjunto de test se mantuvo íntegramente con datos originales, sin augmentación. El hallazgo clave del proyecto fue que el uso de datos sintéticos solo para aprendizaje no supervisado de vocabulario, y no como etiquetas supervisadas, fue lo que permitió superar al resto de configuraciones.

## Capacidades

- Clasificación de severidad de depresión en texto bengalí en cuatro categorías: mínimo, leve, moderado e severo.
- Detección de indicios de ideación pasiva y de ideación suicida activa a partir de contenido textual.
- Procesamiento de publicaciones cortas de redes sociales en bengalí nativo.
- Clasificación supervisada de secuencia única con salida de logits sobre cuatro clases (no genera texto libre).
- Soporte de tool calling / function calling: no.
- Soporte de agentes y razonamiento multi-step: no.
- Capacidades multilingües: no, está restringido a bengalí.
- Capacidades especiales: adaptación de dominio y de tarea mediante DAPT y TAPT sobre vocabulario de salud mental en bengalí.

## Casos de uso

- Monitorización de comunidades en redes sociales: el modelo puede clasificar de forma automática publicaciones en bengalí y priorizar aquellas con indicios de ideación suicida activa, canalizándolas a revisión humana.
- Soporte a moderación de contenido: integrar el clasificador en pipelines de moderación para marcar textos que requieran intervención, aprovechando su F1 de 0,9294 en la clase severa.
- Investigación en salud mental computacional: uso como baseline o componente en estudios académicos sobre severidad depresiva en bengalí, dado que el propio modelo se enmarca en una tesis.
- Triaje en líneas de ayuda: preclasificar mensajes entrantes para que el personal humano atienda primero los casos moderados y severos, dado que el modelo procesa textos de hasta 256 tokens con bajo coste computacional.
- Enriquecimiento de datasets: etiquetar automáticamente grandes volúmenes de publicaciones bengalíes para construir corpus anotados o filtrar muestras por severidad.
- Análisis longitudinal de comunidades: clasificar series de publicaciones a lo largo del tiempo para estudiar la evolución de la severidad en cohortes de usuarios, dado el reducido coste de inferencia de un modelo de 110M parámetros.
- Sistemas de alerta temprana en plataformas regionales: desplegar el clasificador como servicio de baja latencia para detectar contenido de riesgo en bengalí, previa validación clínica y ética.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de 738 publicaciones originales en bengalí:

| Metrica | Valor |
|---|---|
| Accuracy | 87,13% |
| F1 ponderado | 87,20% |
| Precision ponderada | 87,33% |
| Recall ponderado | 87,13% |

F1 por clase:

| Etiqueta | Categoria | F1 | Soporte |
|---|---|---|---|
| 1 | Minimum (leve / no clinico) | 0,9144 | 316 |
| 2 | Mild (depresion moderada) | 0,8571 | 231 |
| 3 | Moderate (severa / ideacion pasiva) | 0,7339 | 107 |
| 4 | Severe (ideacion suicida activa) | 0,9294 | 84 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar (MMLU, HumanEval, GSM8K u otros), ya que la tarea es de clasificacion especifica en bengali.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,22 GB en FP16 y 0,44 GB en FP32 para los pesos; con activaciones y batch pequeño, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada reciente son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual y en la mayoría de iGPU, dado el tamano de 110M parámetros.
- Ejecución en CPU: viable para inferencia por lotes o en tiempo casi real, dado el tamano reducido.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), exportación a ONNX y ejecución con ONNX Runtime, o TorchServe. No se documentan variantes GGUF, por lo que llama.cpp y Ollama requerirían conversión previa no publicada. vLLM y TGI son opciones orientadas a generación, menos habituales para clasificación de secuencias.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| banglamentalBERT-banglaBERT-dapt-tapt | 110M | 256 | Clasificacion de severidad de depresion (4 clases, bn) | MIT | HuggingFace |
| csebuetnlp/banglabert (base) | 110M | 512 (tipico ELECTRA) | Modelo de lenguaje enmascarado en bengali | MIT | HuggingFace |
| Modelos multilingues tipo XLM-R | ~270M (base) | 512 | Clasificacion y generacion multilingue | MIT | HuggingFace |

Nota: no se dispone de resultados de benchmarks comparativos entre este modelo y las alternativas en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales y de licencia. La longitud de contexto, el rendimiento y la idoneidad de las alternativas para la misma tarea no estan documentados en los datos disponibles.

## Limitaciones y advertencias

- Es un prototipo de investigacion academica, no una herramienta clinica; sus salidas describen severidad del contenido textual, no un juicio clinico sobre ninguna persona.
- El rendimiento sobre texto bengali fuera de dominio (escritura formal, otros dialectos) no ha sido evaluado.
- La clase 3 (Moderate, ideacion pasiva) sigue siendo la mas dificil, con F1 de 0,7339, debido a la frontera clinica subjetiva entre ideacion pasiva y activa.
- Riesgo de alucinacion y de clasificacion erronea en categorias limite; requiere revision humana en cualquier flujo de decision sensible.
- Sesgos conocidos: no documentados explicitamente por el autor; el modelo hereda los sesgos de los datos de redes sociales y de las traducciones automaticas empleadas en DAPT, asi como de los datos sinteticos usados en TAPT.
- Limitacion de contexto: 256 tokens maximos, lo que trunca publicaciones largas.
- Restriccion de idioma: solo bengali; su uso con otros idiomas no esta soportado.
- Licencia MIT, que permite uso comercial, aunque dado el caracter de prototipo de investigacion y el dominio sensible, no se recomienda su despliegue en produccion sin validacion adicional.
- La model card consultada referencia identificadores de repositorio distintos (SrothJr/banglabert-bangla-depression-severity-dapt) del ID real del repositorio evaluado; conviene verificar la correspondencia exacta de los pesos antes de su uso.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/SrothJr/banglamentalBERT-banglaBERT-dapt-tapt
- BanglaBERT (modelo base): https://huggingface.co/csebuetnlp/banglabert
- Repositorio referenciado en el codigo de uso: https://huggingface.co/SrothJr/banglabert-bangla-depression-severity-dapt
- Modelo de traduccion NLLB-200-3.3B: https://huggingface.co/facebook/nllb-200-3.3B (referenciado en el pipeline, no enlazado en la model card)
- No se han proporcionado enlaces a papers, blogs, repositorios o demos adicionales en la informacion disponible.
