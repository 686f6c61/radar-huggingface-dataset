# zoukmar75/burotu-glimmer

## Resumen

Burotu-glimmer es un adaptador PEFT (QLoRA de rango 16 en 4 bits) sobre el modelo multimodal `meta-models/Muse-Glimmer-30B` que dota al modelo base de una nueva modalidad de entrada: la metilación del ADN libre circulante (cfDNA). Un proyector de metilación convierte 3.148 sitios CpG medidos en plasma en 16 tokens blandos dentro del espacio de embeddings de Glimmer, de forma análoga a como un proyector de visión transforma píxeles en tokens. Sobre esa representación, las capas de lenguaje aprenden a responder dos preguntas: si existe señal tumoral y de qué tejido de origen procede, entre 23 posibles.

El modelo lo desarrolla el autor independiente zoukmar75 en el marco del Meta Global AI Developer Hackathon 2026, con primer commit el 26 de octubre y la versión v6 el 2 de noviembre. Se entrenaron 217 millones de parámetros sobre 35.000 muestras simuladas en 66 minutos de una única GPU L40S en Modal. El objetivo es demostrar que un modelo de lenguaje de propósito general, sin exposición previa a genómica, puede adquirir una capacidad diagnóstica nueva mediante un adaptador ligero y un conjunto de etiquetas bien diseñado.

La relevancia actual reside en su planteamiento de biopsia líquida como tarea de lectura multimodal: reentrenar el adaptador (alrededor de una hora de GPU) permitiría reformular la misma arquitectura para seguimiento de tratamiento, recaída, daño orgánico o edad biológica. Es, sin embargo, un prototipo de investigación entrenado sobre plasma simulado y validado solo con 27 muestras reales; el propio autor lo declara explícitamente no apto como dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (QLoRA) sobre transformer multimodal Muse-Glimmer-30B; proyector de metilación CpG a tokens |
| Parametros totales | No disponible para el adaptador; el modelo base Muse-Glimmer-30B tiene 30B (según su nombre) |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Parametros entrenados | 217 millones |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Modelo base cargado en 4-bit nf4; el adaptador se distribuye en `trainable.pt` |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | `trainable.pt` (adapter + LoRA), `serving.json`, `mu.npy`, `report.json` |
| Modalidad de entrada | 3.148 sitios CpG de cfDNA convertidos en 16 tokens blandos |
| Clases de salida | 23 tejidos de origen + señal tumoral sí/no |
| Modelo base | `meta-models/Muse-Glimmer-30B`, revisión `a4e59da52a7bc87ae7251dd5545c0dd437c44b68` |
| Tamaño del repo | 1,7 GB |

## Arquitectura y entrenamiento

La arquitectura consta de tres piezas: el modelo base Muse-Glimmer-30B congelado en cuantización 4-bit nf4, un adaptador de metilación que proyecta un vector de 3.148 CpG en 16 tokens dentro del espacio de embeddings del modelo, y un conjunto de matrices LoRA (rango 16) sobre las capas de lenguaje. El entrenamiento se realizó con QLoRA en dos fases separadas, tras comprobar en la primera iteración (v1) que entrenar adaptador y LoRA conjuntamente provocaba colapso: el modelo daba la misma respuesta para todas las muestras.

El conjunto de entrenamiento son 35.000 muestras de plasma simulado, generadas mezclando tumores públicos de TCGA y GEO en fondos sanguíneos sanos públicos, con 5.728 donantes y 8 laboratorios alineados. La evolución entre versiones documenta las decisiones técnicas: v3 introdujo un adaptador más pequeño y regularizado (99,9 % de especificidad, 26 % de señales detectadas), v4 añadió pseudo-donantes combinando fondos sanos de dos o tres personas (42 % de señales a 99,7 % de especificidad) y v6 amplió a 23 tejidos. No se menciona RLHF ni DPO; el ajuste es supervisado sobre etiquetas de señal tumoral y tejido de origen.

## Capacidades

- Detección de señal tumoral en cfDNA a partir de 3.148 sitios CpG de metilación, con umbral de especificidad configurable en `serving.json`.
- Clasificación del tejido de origen del tumor entre 23 clases, con salida de primera opción y top-2.
- Procesamiento de entrada genómica como modalidad nativa: el proyector CpG genera 16 tokens blandos integrados en el contexto del modelo de lenguaje.
- Reentrenamiento del adaptador para nuevas preguntas sobre el mismo motor (seguimiento de tratamiento, recaída, daño orgánico, edad biológica) en aproximadamente una hora de GPU.
- No se documentan capacidades de tool calling, agentes, generación de código ni matemáticas específicas para este adaptador; hereda las del modelo base, no evaluadas en la model card.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en biopsia líquida: el modelo permite experimentar con detección de señal tumoral mínima (0,3 % de ADN tumoral en plasma) sin construir un pipeline propio desde cero, usando el benchmark congelado de 1.745 personas y 1.132 tumores como referencia reproducible.
- Clasificación de tejido de origen en estudios de cáncer de origen primario desconocido: la salida top-2 a 1 % de señal (71 % de acierto) sirve como señal orientativa para priorizar pruebas diagnósticas en un contexto de investigación.
- Reentrenamiento del adaptador para seguimiento de tratamiento: sustituyendo las etiquetas por evolución de carga tumoral, el mismo motor y proyector podrían monitorizar respuesta a terapia, según propone el autor.
- Detección de recaída: el adaptador puede reetiquetarse para discriminar estados post-tratamiento, aprovechando que la arquitectura de entrada CpG permanece fija.
- Estimación de edad biológica: el autor cita esta aplicación como ejemplo de reformulación del adaptador sobre las mismas señales de metilación.
- Validación metodológica de alineación entre laboratorios: el entrenamiento con 8 laboratorios alineados convierte al modelo en un banco de pruebas para estudiar el efecto de la variabilidad técnica en las señales de metilación.
- Demostración educativa de multimodalidad: el proyector CpG ilustra cómo adaptar un LLM a una modalidad nueva con un coste de entrenamiento de 66 minutos en una L40S, útil en docencia sobre PEFT y QLoRA.

## Benchmarks y rendimiento

Evaluación sobre benchmark congelado: 1.745 personas y 1.132 tumores no vistos en entrenamiento, plasma simulado con 23 tipos de tejido.

| ADN tumoral en plasma | 0,3 % | 1 % | 3 % | 10 % |
|---|---|---|---|---|
| Señal detectada (especificidad 99,5 %) | 8 % | 75 % | 92 % | 95 % |
| Tejido de origen correcto a la primera (azar 4 %) | 15 % | 58 % | 85 % | 92 % |
| Tejido de origen en el top 2 | 27 % | 71 % | 91 % | 96 % |

Comparación con el clasificador clásico citada en la model card: tejido correcto 58 % frente a 46 % con 1 % de ADN tumoral. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 30B en 4-bit nf4 requiere del orden de 18-20 GB para los pesos, más el adaptador y el contexto; no se proporciona una cifra oficial.
- Entrenamiento del adaptador: 66 minutos en una única NVIDIA L40S (48 GB) en Modal para 35.000 muestras.
- GPU recomendadas para inferencia: L40S, A100 o H100 por holgura de memoria; en consumer, una RTX 4090 (24 GB) es el límite práctico para el base en 4 bits, no confirmado por el autor.
- Despliegue: la model card indica cargar el base con la revisión fijada y aplicar los pesos mediante `burotu.models.glimmer` del repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| burotu-glimmer | Adaptador CpG sobre LLM multimodal para cfDNA | 217M entrenados sobre base de 30B | No disponible | Apache 2.0 | Hugging Face, demo web, espacio |
| Clasificador clásico de metilación (referencia del autor) | Modelo estadístico sobre CpG | No disponible | No aplica | No disponible | No disponible |
| Muse-Glimmer-30B (base) | LLM multimodal texto-imagen | 30B | No disponible | No disponible en la información | Pesos abiertos referenciados |

No se dispone de datos de benchmarks comparativos con otros adaptadores genómicos publicados en la información proporcionada.

## Limitaciones y advertencias

- Prototipo de investigación, no dispositivo médico: el autor lo declara explícitamente y prohíbe su uso como diagnóstico.
- Entrenado sobre plasma simulado (tumores TCGA/GEO mezclados en sangre sana pública); solo se comprobó con 27 muestras de plasma real.
- El rendimiento cae drásticamente a concentraciones bajas: 8 % de detección a 0,3 % de ADN tumoral y 15 % de acierto de tejido a la primera.
- Riesgo de sobreajuste a donantes documentado en versiones previas (v2 memorizaba donantes); la v6 lo mitiga con 5.728 donantes, pero persiste la brecha entre simulación y clínica.
- La versión v5 mostró fallo de la alarma en personas nuevas, corregido en v6; indica sensibilidad a la distribución de la población.
- Sesgos poblacionales: los datos provienen de cohortes públicas TCGA y GEO, con la composición demográfica que estos conjuntos tengan; no se documenta análisis de sesgo.
- Idiomas y contexto del modelo base no documentados en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y su revisión deben verificarse por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados.
- La integración requiere código propio del repositorio de GitHub; no hay soporte en frameworks de inferencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/zoukmar75/burotu-glimmer
- Demo: https://burotu.com/en/#demo
- Vídeo (3 min): https://youtu.be/LQVoz8USAHo
- Space: https://huggingface.co/spaces/zoukmar75/burotu
- Colección: https://huggingface.co/collections/zoukmar75
- Código y entrenamiento: https://github.com/zoukmar/burotu
- Paper (preprint): https://doi.org/10.5281/zenodo.23941918
- PDF del paper: https://burotu.com/paper
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
