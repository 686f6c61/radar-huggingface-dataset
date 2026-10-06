# taalyelxor/new-azure

## Resumen

New Azure es una coleccion de checkpoints de ajuste fino para robotica basada en OpenVLA-OFT, publicada por el usuario taalyelxor en HuggingFace. No se trata de un modelo de lenguaje de proposito general, sino de un ajuste especifico para simulacion sobre un brazo robotico Franka Research 3 (FR3). El autor parte del checkpoint combinado de LIBERO OFT en el paso 300000 y entrena sobre una configuracion de camara concreta: una camara cenital medida (alineada con el feed real corregido) y una camara de muneca con desplazamiento hacia fuera.

El repositorio ocupa 126,6 GB y contiene ocho checkpoints escalonados (pasos 302500, 305000, 307500, 310000, 312500, 315000, 317500 y 320000). Cada uno incluye pesos, cabezas OFT, adaptador LoRA, configuracion de camara y entrenamiento, y un manifiesto de ejecucion. Los ficheros se verifican contra el commit inmutable de subida, lo que aporta trazabilidad.

Es relevante porque OpenVLA-OFT es una de las lineas abiertas mas activas para control robotico guiado por lenguaje e imagen, y este repositorio documenta un caso concreto de transferencia simulacion-a-realidad sobre hardware FR3 con una geometria de camaras bien especificada. La informacion publica disponible es, sin embargo, muy escasa: no hay model card detallada, licencia declarada ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenVLA-OFT (vision-language-action sobre backbone tipo OpenVLA; no confirmado en la model card del autor) |
| Parametros totales | no disponible (el modelo base OpenVLA es de ~7B parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural; idioma de entrenamiento no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (mas cabezas OFT y adaptador LoRA en el mismo repositorio) |
| Tamano del repositorio | 126,6 GB |
| Numero de checkpoints | 8 (pasos 302500, 305000, 307500, 310000, 312500, 315000, 317500, 320000) |
| Ruta interna | data/experiments/fr3_azure_measured_base_oft/ |

## Arquitectura y entrenamiento

La model card describe el modelo como un ajuste fino de OpenVLA-OFT para simulacion FR3, partiendo del checkpoint combinado LIBERO OFT en el paso 300000. OpenVLA-OFT es, segun la documentacion publica de la familia OpenVLA, una variante de ajuste optimizado de OpenVLA que incorpora decodificacion paralela y chunking de acciones, ademas de adaptadores LoRA, sobre un backbone vision-language-action que combina codificadores visuales con un modelo de lenguaje y una cabeza de acciones discretizadas. Esta descripcion procede de la documentacion general de OpenVLA, no de la model card de este repositorio, que no detalla la arquitectura.

En cuanto a los datos de entrenamiento, la model card unicamente indica que se utiliza "the measured overhead camera matching the corrected real feed and the outward-offset wrist camera", es decir, una camara cenital medida y una camara de muneca desplazada hacia fuera. No se especifica el numero de episodios, el volumen de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio pipeline OpenVLA-OFT. Cada checkpoint incluye cabezas OFT y adaptador LoRA, lo que sugiere que el ajuste se realiza sobre una base congelada con adaptacion de bajo rango, practica habitual en esta familia.

## Capacidades

- Control robotico guiado por lenguaje e imagen: genera acciones para un brazo Franka FR3 en simulacion a partir de observaciones visuales (camara cenital y de muneca) e instrucciones.
- Manipulacion entrenada sobre tareas tipo LIBERO: el punto de partida es un checkpoint combinado de LIBERO OFT, por lo que hereda el repertorio de tareas de ese benchmark (no detallado en la model card).
- Ajuste con adaptadores LoRA y cabezas OFT: los checkpoints incluyen explicitamente estos componentes, pensados para inferencia y posible continuacion del entrenamiento.
- Trazabilidad de versiones: ocho snapshots escalonados que permiten reproducir la curva de entrenamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de agente textual).
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): dispone de entrada visual por la propia naturaleza VLA; no se declaran modos de razonamiento explicito ni audio.

## Casos de uso

- Investigacion en manipulacion robotica: reproducir el ajuste fino de OpenVLA-OFT sobre FR3 en simulacion usando los checkpoints publicados, comparando los distintos pasos de entrenamiento para estudiar la curva de aprendizaje.
- Transferencia simulacion-a-realidad: la configuracion de camaras (cenital medida y muneca con desplazamiento hacia fuera) esta pensada para alinear la simulacion con un feed real corregido, lo que permite experimentar con el gap sim-to-real.
- Evaluacion comparativa de checkpoints: los ocho snapshots permiten medir como evoluciona el exito en tareas de manipulacion entre el paso 302500 y el 320000.
- Reentrenamiento con LoRA: al incluir adaptadores y cabezas OFT por separado, resulta adecuado para continuar el ajuste sobre un dominio propio sin tocar la base.
- Docencia y formacion en robotica: sirve como ejemplo reproducible de pipeline VLA sobre un robot comercial de laboratorio (FR3).
- Benchmarking de metodos de decodificacion de acciones: la variante OFT con decodificacion paralela y chunking de acciones permite comparar estrategias de inferencia en tiempo real.
- Base para despliegue en laboratorio: los checkpoints pueden integrarse en un stack de control FR3 (por ejemplo, ROS) para validar politicas antes de pasar a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito (success rate), ni evaluaciones sobre LIBERO u otros conjuntos, ni comparaciones con el checkpoint base de LIBERO OFT.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. Como referencia de la familia OpenVLA (base ~7B parametros), la inferencia en bf16/fp16 suele requerir del orden de 15-16 GB, pero no se confirma para este ajuste concreto.
- GPU recomendadas: no disponible. Por tamano del repositorio y naturaleza del ajuste, es plausible que quepa en GPUs de 24 GB (por ejemplo, RTX 4090, L4, A10G) y con holgura en A100 o H100, pero no hay confirmacion del autor.
- Consumer GPU: probablemente si en RTX 4090 / RTX 3090 (24 GB) si se mantiene el tamano del backbone base; no confirmado.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato safetensors con cabezas OFT y LoRA apunta a un stack propio de OpenVLA-OFT.
- Latencia y throughput: no disponible.
- Espacio en disco: los 126,6 GB del repositorio completo son el minimo si se descargan los ocho checkpoints; un solo checkpoint ocuparia aproximadamente entre 15 y 16 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| taalyelxor/new-azure | OpenVLA-OFT ajustado a FR3 (simulacion) | no disponible (base OpenVLA ~7B) | no disponible | no disponible | HuggingFace, 0 descargas |
| OpenVLA (base) | Vision-language-action | ~7B | no disponible aqui | licencia abierta segun su publicacion | publico |
| OpenVLA-OFT (LIBERO) | Vision-language-action optimizado | ~7B (referencia) | no disponible aqui | segun su publicacion | publico |
| Alternativas VLA (por ejemplo, pi0, RDT) | Politicas robot | variable | variable | variable | publico |

No se dispone de datos suficientes en la informacion proporcionada para una comparativa cuantitativa fiable; los valores de modelos comparables se indican solo como referencia general de la familia y no se han verificado en este contexto.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no hay descripcion de dataset, hiperparametros, evaluacion ni limitaciones declaradas por el autor.
- Licencia no declarada: sin licencia explicita no es posible determinar si se permite uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce en que idioma se dieron las instrucciones de entrenamiento; el modelo podria degradarse con instrucciones en otros idiomas.
- Especifico de un robot y una camara concretos: el ajuste esta ligado al FR3 y a una geometria de camaras muy concreta (cenital medida y muneca desplazada); cambiar el montaje invalida probablemente el modelo.
- Ambito de simulacion: el entrenamiento es en simulacion, por lo que el rendimiento en el mundo real depende del gap sim-to-real y no esta cuantificado.
- Riesgo de alucinacion de acciones: como modelo generativo de acciones, puede producir trayectorias no validas o inseguras; requiere capas de seguridad en el controlador.
- Sin datos de rendimiento: no hay success rate, ni curvas de exito, ni comparacion con el checkpoint base.
- Repositorio muy grande: 126,6 GB y ocho checkpoints dificultan su descarga y su uso en entornos con poco almacenamiento.
- Cero descargas y cero likes en el momento de la consulta: ausencia de validacion por parte de la comunidad.
- Los resultados de busqueda web asociados a esta consulta no guardan relacion con el modelo (podcasts de frances); no aportan informacion tecnica util.

## Enlaces

- HuggingFace: https://huggingface.co/taalyelxor/new-azure
- Paper de OpenVLA (referencia de la familia base, no citado en la model card): https://arxiv.org/abs/2406.09246
- Paper de OpenVLA-OFT (referencia de la variante, no citado en la model card): https://arxiv.org/abs/2502.19645
- Repositorio OpenVLA (referencia de la familia base, no citado en la model card): https://github.com/openvla/openvla
- Benchmark LIBERO (referencia del checkpoint de partida, no citado en la model card): https://libero-project.github.io/

Nota: los enlaces a papers, repositorios y benchmarks de OpenVLA, OpenVLA-OFT y LIBERO se incluyen como contexto de la familia de modelos; la model card de taalyelxor/new-azure no los referencia de forma explicita.
