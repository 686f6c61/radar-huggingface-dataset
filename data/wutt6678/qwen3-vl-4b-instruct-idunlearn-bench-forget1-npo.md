# wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-NPO

## Resumen

Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-NPO es un adaptador LoRA publicado en HuggingFace por el usuario wutt6678, no un modelo completo. Se distribuye bajo la librería PEFT y está construido sobre el modelo base identificado como outputs_3/mllmu_vanilla_qwen3-vl-4b, que a su vez deriva de Qwen3-VL-4B-Instruct, el modelo de visión-lenguaje de 4.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. El repositorio ocupa solo 0,1 GB, lo que confirma que contiene únicamente los pesos del adaptador y no los del modelo subyacente.

Por la propia nomenclatura del identificador puede inferirse que se trata de un artefacto de investigación sobre desaprendizaje automático (machine unlearning): el sufijo "IDUnlearn-Bench" apunta a un banco de pruebas de desaprendizaje de identidad, "forget1" señalaría la partición de datos a olvidar y "NPO" correspondería a Negative Preference Optimization, una técnica habitual en este campo. Estos extremos no están confirmados en la model card, que se limita a la plantilla por defecto sin rellenar. Cualquier uso en producción exige verificar de forma independiente la naturaleza del ajuste.

Su relevancia es acotada y fundamentalmente académica: interesa a quienes investigan cómo eliminar información concreta de modelos multimodales sin degradar sus capacidades generales, y sirve como punto de reproducibilidad para comparar métodos de desaprendizaje sobre una base VLM moderna. No es un modelo pensado para despliegue directo, sino un delta de pesos experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo base de visión-lenguaje con codificador visual más modelo autoregresivo denso (Qwen3-VL-4B-Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base declarado es de 4.000 millones de parametros |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos LoRA en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, formato de adaptador PEFT/LoRA |
| Tamano del repositorio | 0,1 GB |
| Modelo base | outputs_3/mllmu_vanilla_qwen3-vl-4b |
| Libreria | peft (PEFT 0.19.1) |

## Arquitectura y entrenamiento

El adaptador hereda la arquitectura del modelo base, Qwen3-VL-4B-Instruct, que combina un codificador visual con un modelo de lenguaje autoregresivo denso de 4.000 millones de parámetros. La familia Qwen3-VL se distribuye en variantes densas y MoE, y en esta ficha la variante de 4B corresponde a la densa. Sobre esa base, el repositorio publica exclusivamente pesos LoRA, es decir, matrices de bajo rango que se suman a las proyecciones del modelo original durante la inferencia. No se incluyen pesos fusionados ni el modelo completo.

No hay información verificable sobre el procedimiento de entrenamiento: la model card no documenta número de tokens, composición del dataset, hiperparámetros, régimen de precisión ni si hubo etapas de RLHF o DPO. El nombre del repositorio sugiere el uso de NPO (Negative Preference Optimization) como método de desaprendizaje sobre la partición "forget1" de un banco de pruebas denominado IDUnlearn-Bench, pero esto es una inferencia a partir del identificador y no un dato confirmado por el autor. La única referencia técnica explícita en las etiquetas es el enlace al artículo de Lacoste et al. (2019) sobre el cálculo de impacto ambiental, que forma parte de la plantilla por defecto y no describe el entrenamiento del modelo.

## Capacidades

- Las capacidades del adaptador no están documentadas por el autor en la información proporcionada.
- Al estar construido sobre Qwen3-VL-4B-Instruct, el modelo base declara soporte de respuesta a preguntas visuales, OCR multilingüe, comprensión de documentos, grounding visual, razonamiento espacial, comprensión de vídeo, codificación visual y tareas de agente visual, según la documentación del modelo original.
- No se confirma si el adaptador preserva íntegramente estas capacidades o si el proceso de desaprendizaje las modifica.
- Soporte de tool calling y function calling: no disponible para el adaptador (el modelo base lo soporta según su documentación).
- Soporte de agentes y razonamiento multi-paso: no disponible para el adaptador.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento extendido (thinking), visión o audio: no disponible para el adaptador.

## Casos de uso

- Investigación en desaprendizaje automático: servir como referencia reproducible para estudiar cómo un adaptador LoRA entrenado con NPO modifica el comportamiento del modelo base respecto a una partición de datos concreta. Adecuado porque el artefacto es pequeño (0,1 GB) y fácil de versionar en experimentos comparativos.
- Auditoría de privacidad y cumplimiento: evaluar si el desaprendizaje elimina de forma efectiva determinada información de identidad del modelo, midiendo la diferencia entre el modelo base y el adaptador mediante pruebas controladas de extracción.
- Comparación de métodos de unlearning: usar este adaptador como uno de los brazos experimentales frente a otras variantes (por ejemplo, distintas particiones "forget" o algoritmos alternativos) manteniendo constante el modelo base.
- Reproducción de resultados académicos: cargar el adaptador sobre el modelo base declarado para replicar métricas publicadas en trabajos de desaprendizaje, siempre que se disponga de la partición y el protocolo correspondientes.
- Estudio de degradación de capacidades multimodales: medir cómo cambia el rendimiento en tareas de visión-lenguaje del modelo base tras aplicar el adaptador, para cuantificar el coste del olvido sobre capacidades no objetivo.
- Formación y docencia: ilustrar de forma práctica, en cursos de ética de IA o seguridad de modelos, qué es un adaptador PEFT y cómo se materializa un proceso de desaprendizaje en un repositorio real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas y la documentación del repositorio no aporta comparaciones cuantitativas.

## Requisitos de hardware

- El adaptador por sí solo no es ejecutable: requiere cargar el modelo base Qwen3-VL-4B-Instruct (o el checkpoint desde el que se entrenó) y aplicar los pesos LoRA encima.
- VRAM estimada para el modelo base de 4B parámetros: del orden de 8 a 10 GB en BF16/FP16, aproximadamente 5 GB en cuantización INT8 y en torno a 3 GB en INT4. Son estimaciones generales para un modelo denso de ese tamaño, no cifras publicadas para este repositorio concreto.
- GPU recomendadas: para precisión completa, tarjetas con al menos 12-16 GB de VRAM (RTX 4080, RTX 4090, A10, L4). Para cuantización INT4, puede caber en GPU de consumo con 6-8 GB.
- Cabe en GPU de consumo: sí, en cuantización reducida y en GPUs con suficiente memoria; el adaptador añade un coste de memoria despreciable (0,1 GB).
- Opciones de despliegue: al ser un adaptador PEFT, es compatible con bibliotecas que cargan adaptadores LoRA sobre transformers. No se dispone de confirmación de compatibilidad con vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada adaptadores de desaprendizaje comparables publicados sobre Qwen3-VL-4B-Instruct ni sobre modelos de visión-lenguaje del mismo tamaño con los que establecer una comparación fiable de parámetros, contexto y licencia.

## Limitaciones y advertencias

- La model card está sin rellenar: casi todos los campos figuran como "More Information Needed", por lo que no hay información fiable sobre uso previsto, sesgos, datos de entrenamiento o evaluación.
- No se especifica licencia. El uso comercial queda sin cobertura legal clara y debe consultarse el repositorio original antes de cualquier despliegue.
- El modelo base declarado (outputs_3/mllmu_vanilla_qwen3-vl-4b) no es un checkpoint público estándar de Qwen, sino una ruta interna, lo que dificulta la reproducción exacta del entorno de entrenamiento.
- Al ser un adaptador de desaprendizaje, existe riesgo de que las capacidades generales del modelo base estén degradadas o alteradas de forma no documentada.
- Riesgo de alucinación: no evaluado ni documentado para este artefacto.
- Sesgos conocidos: no disponibles. Se heredarían, en su caso, los del modelo base, que tampoco se documentan aquí.
- Limitaciones de contexto e idioma: no disponibles.
- Cero descargas y cero "likes" en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No debe tratarse como un modelo listo para producción: es un artefacto de investigación sin garantías de calidad, soporte ni mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-NPO
- Modelo base de referencia (Qwen3-VL-4B-Instruct): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio GitHub de la familia Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Espejo del modelo base en OpenExplorer: https://huggingface.co/OpenExplorer/Qwen3-VL-4B-Instruct
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_4b_instruct
- Página en Ollama: https://ollama.com/library/qwen3-vl:4b-instruct
- Artículo citado en las etiquetas (Lacoste et al., 2019, cálculo de impacto ambiental): https://arxiv.org/abs/1910.09700
