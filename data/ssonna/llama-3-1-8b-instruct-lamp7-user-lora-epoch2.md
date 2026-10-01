# ssonna/Llama-3.1-8B-Instruct-LaMP7-user-LoRA-epoch2

## Resumen

Llama-3.1-8B-Instruct-LaMP7-user-LoRA-epoch2 es una coleccion de 1496 adaptadores LoRA (Low-Rank Adaptation) independientes, uno por cada usuario del split de test de la tarea LaMP-7 (parafraseo de tuits) sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. No se trata de un modelo unico, sino de un repositorio de pesos de adaptadores publicados por el usuario ssonna, con un enfoque de personalizacion extrema por usuario inspirado en la metodologia OPPU (un adaptador PEFT por usuario).

El problema que resuelve es el de la personalizacion a nivel de usuario individual: cada adaptador se entrena exclusivamente con el historial de perfil de un unico usuario, de modo que el modelo aprende su estilo, vocabulario y patrones de escritura sin compartir informacion entre usuarios. Esto permite evaluar hasta que punto una adaptacion de parametros muy reducida puede capturar la idiosincrasia de una persona concreta sin modificar el modelo base, que permanece congelado y no se distribuye en este repositorio.

El modelo base subyacente, Llama 3.1 8B Instruct, es un transformer decoder-only de aproximadamente 8 030 millones de parametros con una ventana de contexto de 128 000 tokens, desarrollado por Meta. El repositorio, de 20,4 GB, solo contiene adaptadores, un fichero index.jsonl con metadatos por carpeta y ficheros identity.json con los identificadores de usuario y de consulta. Se distribuye bajo la Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Llama 3.1 8B Instruct) con adaptadores LoRA sobre q_proj y v_proj |
| Parametros totales | Modelo base: ~8 030 millones. Conjunto de adaptadores: no disponible (cada adaptador es de rango 8) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | Base en bfloat16 y adaptadores en float32; no se especifican cuantizaciones adicionales (no disponible) |
| Idiomas soportados | no disponible (el corpus LaMP-7 es en ingles, por lo que los adaptadores estan orientados a ese idioma) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json, organizados en subcarpetas bajo users/ |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama 3.1 8B Instruct, un transformer decoder-only con atención de consultas agrupadas (GQA) y una ventana de contexto de 128 000 tokens. Sobre el se aplican 1496 adaptadores LoRA de bajo rango: rango 8, alpha 8 y dropout 0,05, dirigidos unicamente a los modulos q_proj y v_proj de la atención. El modelo base se mantiene congelado y en precision bfloat16, mientras que los pesos de los adaptadores se almacenan en float32. Cada adaptador se guarda como un fichero safetensors independiente junto a su adapter_config.json, con una estructura de carpetas cuyo nombre son los primeros 24 caracteres hexadecimales del SHA-256 del identificador de usuario codificado en JSON.

El entrenamiento emplea ajuste supervisado (SFT) con un adaptador por usuario, entrenado exclusivamente con el historial de perfil de ese usuario y en el estilo OPPU. La configuracion incluye el optimizador AdamW con tasa de aprendizaje 0,0001, weight decay 0,01, planificador lineal con warmup ratio 0,1 y recorte de gradiente 0,3; se entrenan 2 epocas con tamano de lote efectivo 8. La funcion de perdida es entropia cruzada restringida a la completion (completion-only cross entropy) sin truncacion, y se fija la semilla 42. No se documenta en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de que proviene del split de test basado en usuarios de LaMP-7. Tampoco se indica el uso de RLHF, DPO u otras tecnicas de alineacion adicionales para los adaptadores.

## Capacidades

- Generacion de texto condicionada al estilo individual del usuario, gracias al ajuste por usuario sobre la tarea LaMP-7 (parafraseo de tuits).
- Parafraseo de texto: la tarea objetivo de los adaptadores es reescribir tuits preservando el significado y adaptando el registro al estilo del usuario.
- Personalizacion a nivel de usuario: cada adaptador reproduce patrones de escritura aprendidos del historial de perfil de una persona concreta.
- Capacidades heredadas del modelo base Llama 3.1 8B Instruct: generacion de texto general, razonamiento, codigo y matematicas basicas.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada (el modelo base Llama 3.1 si lo soporta, pero no se especifica para estos adaptadores).
- Soporte de agentes y razonamiento multi-paso: no documentado para estos adaptadores.
- Capacidades multilingues: no disponibles; los adaptadores estan orientados al corpus de tuits en ingles de LaMP-7.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre personalizacion de LLM: el repositorio permite reproducir y analizar el enfoque OPPU, comparando 1496 adaptadores por usuario para estudiar cuanta capacidad de personalizacion cabe en un LoRA de rango 8 sobre q_proj y v_proj.
- Evaluacion de la tarea LaMP-7: servir como referencia para medir el rendimiento de parafraseo de tuits por usuario usando el split de test oficial, con los query_ids identificados en cada identity.json.
- Experimentos de privacidad diferencial y aislamiento de datos: al entrenar un adaptador aislado por usuario sin compartir historiales, es un banco de pruebas para estudiar fuga de informacion entre usuarios frente a un modelo adaptado de forma conjunta.
- Servicio de inferencia multi-LoRA: desplegar un unico modelo base Llama 3.1 8B Instruct con intercambio dinamico de adaptadores (por ejemplo, mediante el modo multi-LoRA de vLLM) para personalizar respuestas por cliente sin mantener 1496 copias del modelo completo.
- Generacion de contenido con voz de marca o autor: usar el adaptador de un usuario o entidad como plantilla para reescribir textos manteniendo un estilo consistente en redes sociales.
- Estudio de eficiencia de parametros: analizar la relacion entre el numero de muestras del historial de perfil (history_count en index.jsonl) y la calidad del adaptador resultante, con vistas a definir minimos de datos por usuario.
- Base para pipelines de investigacion reproducible: la inclusion de sha256 por adaptador en index.jsonl facilita la verificacion de integridad y la trazabilidad en experimentos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (por ejemplo, ROUGE, BLEU o resultados oficiales de LaMP-7) para los adaptadores ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM para inferencia: el conjunto de adaptadores es de tamano reducido, pero la inferencia requiere cargar el modelo base Llama 3.1 8B Instruct. En bfloat16 el base ocupa aproximadamente 16 GB de VRAM, y cada adaptador anade una cantidad despreciable.
- Cuantizacion: con cuantizacion de 4 bits el base se reduce a aproximadamente 5-6 GB, aunque no se especifica en la informacion disponible que los adaptadores hayan sido validados en esa configuracion.
- GPU recomendadas: A100 (40 o 80 GB), H100 (80 GB) y L40S para despliegue en servidor; tarjetas de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el base en bfloat16 o cuantizado.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con 16 GB o mas de VRAM en bfloat16, y en GPUs de 8 GB con cuantizacion agresiva.
- Opciones de despliegue: PEFT junto a transformers (como muestra la model card), ademas de vLLM, TGI o llama.cpp, siempre que soporten carga de adaptadores LoRA. Para servir muchos adaptadores simultaneamente es especialmente relevante el soporte multi-LoRA de vLLM.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo / recurso | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ssonna/Llama-3.1-8B-Instruct-LaMP7-user-LoRA-epoch2 | ~0,1 M por adaptador sobre un base de ~8,03 B | 128 000 tokens (base) | 1496 adaptadores LoRA por usuario (OPPU) para LaMP-7 | Llama 3.1 Community License | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-3.1-8B-Instruct | ~8,03 B | 128 000 tokens | Modelo instruct generalista, sin personalizacion por usuario | Llama 3.1 Community License | HuggingFace (acceso con aceptacion de licencia) |
| meta-llama/Llama-3.1-8B | ~8,03 B | 128 000 tokens | Modelo base preentrenado, sin ajuste de instrucciones | Llama 3.1 Community License | HuggingFace (acceso con aceptacion de licencia) |
| Colecciones publicas equivalentes de adaptadores por usuario para LaMP-7 | no disponible | no disponible | no disponible | no disponible | no disponible en los resultados de busqueda |

## Limitaciones y advertencias

- No es un modelo autonomo: para usar cualquier adaptador es imprescindible descargar y cargar el modelo base meta-llama/Llama-3.1-8B-Instruct por separado, que no se incluye en el repositorio.
- Alcance muy restringido: los adaptadores estan entrenados para la tarea LaMP-7 (parafraseo de tuits) y el estilo de un unico usuario. Su uso fuera de ese dominio puede degradar el comportamiento respecto al modelo base.
- Riesgo de sobreajuste: con 2 epocas, rango 8 y conjuntos de datos limitados al historial de cada usuario, es esperable un ajuste fuerte al estilo particular del usuario y una generalizacion pobre a otras tareas o usuarios.
- Riesgo de alucinacion: heredado del modelo base Llama 3.1 8B Instruct; no se documenta ninguna mitigacion adicional en los adaptadores.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al derivar de Llama 3.1 y de contenidos de tuits personales, pueden reproducir sesgos presentes en esos datos.
- Limitaciones de contexto e idioma: la ventana de 128 000 tokens es la del base, pero la calidad de la personalizacion fuera del ingles no esta documentada.
- Privacidad: aunque cada adaptador se entrena de forma aislada, los pesos pueden memorizar caracteristicas del historial del usuario; conviene tratarlos como datos potencialmente sensibles.
- Restricciones de licencia: se distribuye bajo la Llama 3.1 Community License, que impone condiciones de uso (incluida la politica de uso aceptable y obligaciones de atribucion con la mencion "Built with Llama"). Debe revisarse antes de cualquier uso comercial.
- Trazabilidad de uso: el repositorio no registra descargas ni likes, y no se aportan informes de evaluacion, por lo que la calidad real de los adaptadores no esta verificada de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssonna/Llama-3.1-8B-Instruct-LaMP7-user-LoRA-epoch2
- Modelo base Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base preentrenado Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio oficial de Llama (codigo y documentacion): https://github.com/meta-llama/llama-models/blob/main/README.md
- Repositorio de referencia de Llama 3 Instruct: https://github.com/GargTanya/llama3-instruct
- Notebook de ejemplo para Llama 3.1 8B Instruct: https://colab.research.google.com/github/NeuralFalconYT/Meta-Llama-3.1-Colab/blob/main/Llama_3_1_8B_Instruct.ipynb
