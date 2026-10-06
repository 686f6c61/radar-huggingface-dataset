# SrothJr/banglamentalBERT-banglaBERT-dapt-classifier

## Resumen

banglamentalBERT-banglaBERT-dapt-classifier es un clasificador de texto en bengalí (bn) desarrollado por el usuario SrothJr como subcomponente de un sistema multimodal de detección de riesgo en salud mental. El modelo lee texto en bengalí y devuelve una distribución de probabilidad sobre cuatro niveles de gravedad de depresión (Minimum, Mild, Moderate y Severe), que después se combina mediante lógica difusa con la salida de un segundo modelo de severidad suicida para producir un nivel de riesgo final. Forma parte de la tesis "Detecting Mental Health and Suicidal Tendencies on Social Media using Multimodal NLP" de BRAC University.

Arquitectónicamente es un BanglaBERT, es decir, un discriminador ELECTRA de 12 capas y 768 dimensiones ocultas, con 110.620.420 parámetros totales. Sobre el checkpoint base (csebuetnlp/banglabert) se aplicó un preentrenamiento adaptativo al dominio (DAPT) con 250.154 líneas traducidas de 15 subreddits de salud mental mediante NLLB-200-3.3B, seguido de un TAPT por fold y un ajuste fino supervisado sobre 4.897 publicaciones anotadas de gravedad de depresión en bengalí.

Su relevancia radica en que aborda un nicho poco cubierto: la clasificación de salud mental en bengalí, un idioma con recursos limitados. La licencia MIT facilita su reutilización, aunque sus cifras de rendimiento proceden de una evaluación dentro del mismo dominio de entrenamiento y deben interpretarse como una comprobación de funcionamiento, no como una medida de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (discriminador), 12 capas, 768 dimensiones ocultas; base BanglaBERT |
| Parametros totales | 110.620.420 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (secuencia máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bengalí (bn) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `csebuetnlp/banglabert`, un codificador tipo ELECTRA entrenado para bengalí. La cabeza de clasificación se ajusta para producir cuatro clases de gravedad. El pipeline de entrenamiento tiene tres fases: (1) DAPT sobre 250.154 líneas traducidas desde 15 subreddits de salud mental en inglés mediante NLLB-200-3.3B, que adapta el modelo al vocabulario y registro del dominio; (2) TAPT por fold sobre los textos de la partición de entrenamiento correspondiente, con objetivo de modelado de lenguaje enmascarado (MLM); y (3) ajuste fino supervisado sobre 4.897 publicaciones anotadas de gravedad de depresión (dataset de Kabir et al.).

Los hiperparámetros documentados son: longitud máxima de secuencia 256, tasa de aprendizaje 2e-5 y tamaño de lote efectivo 16. La evaluación se realizó con validación cruzada estratificada de 5 folds, y se reporta el checkpoint del fold 5. No se documentan técnicas de decodificación especulativa ni mecanismos de atención alternativos; el modelo es un transformer encoder estándar.

## Capacidades

- Clasificación de texto en bengalí en cuatro niveles de gravedad de depresión: Minimum, Mild, Moderate y Severe.
- Salida de una distribución de probabilidad completa sobre las cuatro clases, no solo la etiqueta dominante, lo que permite usar señales parciales en capas posteriores de decisión.
- Integración como subcomponente de un sistema multimodal con lógica difusa (combinación con un modelo de severidad suicida).
- Procesamiento de texto plano o texto extraído por OCR de memes (según el diseño del sistema, aunque el rendimiento en ese tipo de entrada no se ha evaluado de forma independiente).
- No dispone de capacidades documentadas de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Triaje de riesgo en plataformas de contenido: el modelo puede clasificar publicaciones en bengalí y priorizar para revisión humana aquellas que caen en las clases Moderate o Severe, usando la distribución de probabilidad para ordenar por urgencia.
- Moderación asistida en foros y redes sociales bengalíes: integrado en un pipeline de moderación que marca contenido potencialmente relacionado con depresión para intervención o derivación a recursos.
- Investigación en salud mental computacional: permite etiquetar corpus en bengalí con cuatro niveles de gravedad como paso previo a estudios epidemiológicos o de tendencias.
- Componente de un sistema multimodal de alerta: tal como está diseñado, alimenta una capa de lógica difusa que combina su salida con la de un clasificador de severidad suicida para calcular un nivel de riesgo final (Minimal, Low, Elevated, Critical).
- Monitorización de comunidades online: seguimiento agregado de la distribución de clases a lo largo del tiempo para detectar cambios en el discurso de una comunidad en bengalí.
- Filtrado previo en sistemas de apoyo: en chatbots o líneas de ayuda, clasificar el mensaje entrante antes de decidir la respuesta o el protocolo de escalado.
- Anotación semiautomática de datasets: generar etiquetas preliminares que los anotadores humanos revisan, reduciendo el coste de construir corpus en bengalí.

## Benchmarks y rendimiento

Evaluación en dominio (sobre el dataset de depresión en bengalí):

| Metrica | Valor |
|---|---|
| Accuracy | 93,20 % |
| Macro-F1 | 0,9182 |
| Weighted-F1 | 0,9308 |

F1 por clase:

| Etiqueta | Categoria | F1 |
|---|---|---|
| 1 | Minimum (leve / no clínico) | 0,963 |
| 2 | Mild (depresión moderada) | 0,924 |
| 3 | Moderate (grave / ideación pasiva) | 0,832 |
| 4 | Severe (ideación suicida activa) | 0,954 |

Advertencia del propio autor: estas métricas se calcularon sobre un split de test del mismo conjunto de datos usado en entrenamiento, con aproximadamente un 80 % de solapamiento con el dominio de entrenamiento. Deben tomarse como una comprobación de funcionamiento, no como una estimación de generalización. No se han publicado resultados de benchmarks estándar independientes (por ejemplo MMLU o HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, aproximadamente 442 MB solo para pesos (110,62 M de parámetros x 4 bytes); en float16, unos 221 MB. Con activaciones, tokenizador y overhead de framework, es razonable contar entre 0,6 y 1,5 GB según lote y longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, T4, A10 o superiores ejecutan el modelo sin dificultad. No requiere GPU de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: la model card documenta carga con `transformers` (AutoTokenizer + AutoModelForSequenceClassification) y PyTorch. Al estar en safetensors, es compatible con servidores tipo TGI o vLLM, aunque no se documentan instrucciones específicas para ellos. No se ofrecen pesos en GGUF, por lo que Ollama o llama.cpp no están soportados de serie.
- Latencia y throughput estimados: no disponible. No se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| banglamentalBERT-banglaBERT-dapt-classifier | 110,62 M | 256 | Clasificación de depresión (4 clases, bn) | MIT | HuggingFace |
| csebuetnlp/banglabert | ~110 M | 512 | Modelo base de lenguaje (bn) | MIT | HuggingFace |
| Modelos de clasificación de salud mental en bengalí equivalentes | no disponible | no disponible | no disponible | no disponible | no disponible |

El comparador directo más relevante es el propio modelo base `csebuetnlp/banglabert`, del que este checkpoint deriva mediante DAPT, TAPT y ajuste fino supervisado. No se dispone de datos verificación de otros clasificadores de depresión en bengalí comparables en la información proporcionada.

## Limitaciones y advertencias

- Las métricas reportadas (93,20 % de accuracy) proceden de un split con aproximadamente un 80 % de solapamiento con el dominio de entrenamiento; no son una medida de generalización a datos nuevos.
- El rendimiento sobre texto de memes (corto, coloquial, extraído por OCR) no se ha evaluado de forma independiente.
- No es una herramienta clínica: las salidas describen el contenido textual, no constituyen un juicio sobre una persona real. Cualquier uso debe enmarcarse en detección de señales y derivación, nunca en diagnóstico.
- Un clasificador de riesgo en salud mental puede generar falsos positivos y falsos negativos con consecuencias sensibles; requiere revisión humana en cualquier flujo de producción.
- Sesgos potenciales derivados del corpus DAPT: los datos se tradujeron automáticamente desde subreddits en inglés con NLLB-200-3.3B, por lo que pueden heredar sesgos del texto original y artefactos de traducción.
- Riesgo de alucinación: no aplica en sentido generativo, ya que es un clasificador; sin embargo, puede producir clasificaciones erróneas con alta confianza aparente.
- Soporte únicamente en bengalí (bn); no se ha entrenado ni evaluado en otros idiomas.
- Discrepancia de identificadores: el ID de HuggingFace de esta ficha es `SrothJr/banglamentalBERT-banglaBERT-dapt-classifier`, mientras que el código de carga de la model card referencia `SrothJr/banglabert-dapt-depression-classifier`. Conviene verificar cuál es el repositorio correcto antes de desplegar.
- Según la model card, el checkpoint no contiene un tokenizador guardado por completo; hay que cargar el tokenizador desde el repositorio y comprobar que los ficheros son los correctos.
- El repositorio presenta cero descargas y cero valoraciones, por lo que no hay validación de la comunidad.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las implicaciones éticas y legales del uso de modelos de salud mental en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SrothJr/banglamentalBERT-banglaBERT-dapt-classifier
- Modelo base BanglaBERT: https://huggingface.co/csebuetnlp/banglabert
- Modelo de traducción NLLB-200-3.3B: https://huggingface.co/facebook/nllb-200-3.3B
- Repositorio citado en el código de carga de la model card: https://huggingface.co/SrothJr/banglabert-dapt-depression-classifier
- Tesis de referencia: "Detecting Mental Health and Suicidal Tendencies on Social Media using Multimodal NLP", BRAC University, Department of CSE, 2026 (enlace no disponible)
- Dataset de anotación (Kabir et al.): enlace no disponible
