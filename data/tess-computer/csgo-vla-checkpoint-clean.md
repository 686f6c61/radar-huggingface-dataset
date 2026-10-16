# TESS-Computer/csgo-vla-checkpoint-clean

## Resumen

El modelo `TESS-Computer/csgo-vla-checkpoint-clean` es un adaptador LoRA (PEFT) publicado por el usuario TESS-Computer que se monta sobre el modelo base multimodal `Qwen/Qwen3-VL-2B-Instruct`. Se trata, por tanto, de un ajuste fino ligero y no de un modelo entrenado desde cero: el repositorio de 0,8 GB contiene unicamente los pesos del adaptador y su configuracion, y para ejecutarlo hay que cargar previamente el modelo base.

La etiqueta del repositorio (`csgo-vla`) y el tag `image-text-to-text` apuntan a un modelo de vision-lenguaje-accion (VLA) orientado a videojuegos, en concreto a Counter-Strike: Global Offensive, un campo emergente en el que modelos pequenos multimodal se emplean como agentes que observan fotogramas y emiten acciones. No obstante, la model card publicada es la plantilla vacia de HuggingFace y no contiene ninguna descripcion real: no se documentan datos de entrenamiento, hiperparametros, objetivos ni evaluacion.

Su relevancia actual es limitada y fundamentalmente experimental: no tiene descargas ni likes, carece de licencia declarada y no aporta resultados de benchmarks. Debe tratarse como un artefacto de investigacion sin validar, util como referencia de como adaptar un VLM pequeno a un dominio especifico mediante LoRA, pero no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre transformer multimodal (modelo base Qwen3-VL-2B-Instruct, arquitectura `qwen3_vl`) |
| Parametros totales | 2B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion proporcionada; la hereda del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos `safetensors` del adaptador en el formato original; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base debe obtenerse por separado |
| Tamano del repositorio | 0,8 GB |
| Libreria | peft (compatible con transformers) |
| Pipeline declarado | text-generation (con entrada de imagen y texto) |
| Version de PEFT indicada | 0.18.0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) aplicado sobre `Qwen/Qwen3-VL-2B-Instruct`, un modelo de vision-lenguaje de 2.000 millones de parametros de la familia Qwen3-VL. La arquitectura subyacente es, por tanto, un transformer multimodal con codificador de vision y decodificador de lenguaje; el adaptador introduce matrices de bajo rango en determinadas capas para especializar el modelo sin reentrenar todos los pesos. El repositorio no especifica sobre que modulos se aplica el LoRA, ni el rango, ni el valor de alpha.

No hay absolutamente ningun dato publicado sobre el entrenamiento: se desconoce el conjunto de datos (aunque el nombre sugiere capturas o fotogramas de CS:GO y etiquetas de accion), el numero de tokens o muestras, la composicion del dataset, el regimen de precision, si hubo RLHF, DPO o aprendizaje por imitacion, y si se aplicaron tecnicas como decodificacion especulativa o atencion lineal. La model card es la plantilla generica de HuggingFace con todos los campos marcados como `[More Information Needed]`, incluido el bloque de impacto ambiental y la cita bibliografica.

## Capacidades

- Generacion de texto condicionada por imagen: el pipeline declarado es `image-text-to-text`, por lo que el modelo acepta entradas multimodales ademas de texto.
- Capacidades heredadas del modelo base Qwen3-VL-2B-Instruct (comprension de imagen, descripcion visual, pregunta-respuesta sobre imagenes, generacion de texto). No estan verificadas para este adaptador concreto.
- Posible emision de acciones o decisiones de juego, segun sugiere el nombre `csgo-vla`; no documentado ni verificado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): solo vision, heredada del modelo base; el resto no disponible.

## Casos de uso

- Investigacion en agentes VLA para videojuegos: usar el adaptador como punto de partida para reproducir o comparar experimentos de vision-lenguaje-accion en entornos tipo CS:GO, midiendo la tasa de exito de las acciones generadas frente a las etiquetas reales.
- Prototipado rapido de politicas de juego: al ser un adaptador de 0,8 GB sobre un modelo de 2B, permite iterar en una sola GPU consumer sin reentrenar el modelo completo.
- Analisis de fotogramas en tiempo real con presupuesto de computo reducido: el tamano del modelo base (2B) lo hace apto para experimentos de inferencia de baja latencia sobre capturas de pantalla o streams de video.
- Base para aprendizaje por imitacion: el adaptador puede servir como inicializacion para posteriores fases de fine-tuning supervisado o RL sobre demostraciones de jugadores.
- Evaluacion comparativa de tecnicas PEFT: util como caso practico para estudiar la transferencia de un VLM generico a un dominio muy especializado con LoRA.
- Docencia y talleres sobre fine-tuning multimodal: su tamano reducido y su integracion nativa con `transformers` y `peft` lo hacen manejable en entornos con recursos limitados.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion real: no hay evidencia de rendimiento, licencia ni documentacion que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye seccion de evaluacion (todos los campos estan marcados como `[More Information Needed]`) y no hay articulo, blog ni repositorio asociado con metricas. Tampoco se dispone de datos de latencia o throughput.

## Requisitos de hardware

Estimaciones derivadas del tamano del modelo base; no confirmadas por el autor del adaptador.

- VRAM en precision completa (bf16/fp16) para los pesos del modelo base: aproximadamente 4 GB, mas el coste de la cache KV y del codificador de vision.
- VRAM en inferencia practica con bf16: del orden de 5 a 7 GB, dependiendo de la longitud de contexto y del tamano de las imagenes de entrada.
- VRAM en cuantizacion de 4 bits (por ejemplo bitsandbytes): aproximadamente 2,5 a 4 GB en total.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares; tambien en GPUs de 8 GB con cuantizacion. En GPUs de 6 GB seria ajustado y requeriria 4 bits.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para este tamano; no aportan ventaja salvo por concurrencia elevada.
- Opciones de despliegue: `transformers` + `peft` (ruta natural, ya que es un adaptador), y opcionalmente vLLM con soporte de adaptadores LoRA. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir a GGUF, ya que no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

Los datos del modelo analizado corresponden a lo publicado en el repositorio; el resto de columnas se incluye a titulo orientativo y no procede de la informacion suministrada.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad de benchmarks |
|---|---|---|---|---|---|
| TESS-Computer/csgo-vla-checkpoint-clean | 2B (base) + LoRA | no disponible | Adaptador LoRA multimodal especializado | no disponible | no disponible |
| Qwen/Qwen3-VL-2B-Instruct | 2B | no disponible en la informacion facilitada | VLM generalista | no disponible en la informacion facilitada | si, publicados por el autor del modelo base |
| Otros VLM pequenos de proposito general (por ejemplo, familias de 2B con vision) | en torno a 2B | no disponible | VLM generalista | variable | no aplica a esta ficha |

No se dispone de modelos comparables especificamente en la categoria de agentes VLA para CS:GO dentro de la informacion proporcionada, por lo que la comparativa directa con alternativas equivalentes queda como no disponible.

## Limitaciones y advertencias

- Model card vacia: no hay documentacion de uso previsto, datos de entrenamiento, evaluacion ni limitaciones declaradas por el autor.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial esta permitido. En la practica, esto bloquea cualquier despliegue en produccion hasta aclararlo con el autor, ademas de las condiciones que imponga el modelo base Qwen3-VL-2B-Instruct.
- Riesgo de alucinacion: no evaluado. Al tratarse de un modelo de 2B especializado sin validacion, la probabilidad de salidas incorrectas o incoherentes es alta, especialmente fuera del dominio de entrenamiento.
- Sesgos conocidos: no documentados. Al no describirse el dataset, no puede auditarse la presencia de sesgos en los datos de ajuste.
- Limitaciones de idioma: no se declara ningun idioma soportado; el comportamiento multilingue es desconocido.
- Ambito muy restringido: por nombre y etiquetas, el adaptador parece orientado a un unico videojuego, por lo que su rendimiento fuera de ese dominio es impredecible.
- Cero adopcion: el repositorio no tiene descargas ni likes, lo que implica ausencia de validacion por parte de la comunidad.
- Riesgo de sobreajuste al dominio: los adaptadores LoRA pequenos entrenados sobre datos muy especificos suelen degradar las capacidades generales del modelo base.
- Reproducibilidad: sin datos de entrenamiento ni hiperparametros, los resultados no son reproducibles.
- Consideracion legal adicional: el uso de datos derivados de un videojuego comercial puede estar sujeto a los terminos de servicio del editor, cuestion que la ficha del modelo no aborda.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TESS-Computer/csgo-vla-checkpoint-clean
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Referencia citada en los tags del repositorio (Lacoste et al., 2019, calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact

Nota sobre la busqueda web: los resultados obtenidos corresponden a entidades sin relacion con el modelo (el satelite TESS de la NASA, la ingenieria estructural T/E/S/S, el proveedor noruego de mangueras TESS, la actriz Tess Barthelemy y la base de datos de marcas del USPTO). No se ha encontrado ningun paper, blog, repositorio de codigo ni demo asociados a este adaptador.
