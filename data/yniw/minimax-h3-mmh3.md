# yniw/MiniMax-H3-mmh3

## Resumen

yniw/MiniMax-H3-mmh3 es un repositorio de pesos auxiliares publicado por el usuario yniw el 14 de septiembre de 2026, pensado para el motor de inferencia [mmh3](https://github.com/niw/mmh3), dedicado a MiniMax H3. No contiene un modelo completo, sino ficheros que siguen la estructura del directorio `models` de mmh3. En concreto, incluye el parche `patches/minimax_h3_fasth3_vsa_datafree_patch_rank64.safetensors`, que transforma el DiT FL2VA podado INT8 ConvRot de Comfy-Org en el checkpoint FastH3 VSA-DataFree de FastVideo, capaz de generar vídeo en cuatro pasos con atención dispersa de vídeo (VSA).

El interes practico del repositorio es que reduce la diferencia entre los pesos de FastH3 y los de MiniMax H3 a un LoRA de rango 64, y convierte a la topologia del DiT INT8 podado los tensores que un LoRA no puede transportar, como las compuertas VSA y el AdaLN reajustado. Esto permite ejecutar un pipeline de generacion de video texto-a-video en muy pocos pasos de muestreo y con atencion en precision mixta int8-fp8, sobre un DiT ya cuantizado y podado, lo que abarata el coste de inferencia frente al modelo base sin destilar.

Se trata de un artefacto muy reciente y sin validacion comunitaria: acumula 0 descargas y 0 likes en el momento de redactar esta ficha, y su licencia es la MiniMax H3 Community License Agreement (etiquetada como `license: other`). Cualquier uso en produccion exige revisar las restricciones de la seccion V y del anexo A (Acceptable Use Policy) del acuerdo, que se aplican tanto a MiniMax H3 como a este derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con atencion dispersa de video (VSA); variante FL2VA con cuantizacion INT8 ConvRot |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video; no se documenta ventana de contexto de texto) |
| Tipos de cuantizacion | INT8 en el DiT podado de origen (INT8 ConvRot); atencion ejecutable en precision mixta `int8-fp8` |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (`license: other`), con ficheros LICENSE y NOTICE |
| Formato de pesos | safetensors (parche con LoRA de rango 64 mas tensores VSA y AdaLN) |
| Tamano del repositorio | 2,7 GB |
| Pipeline declarado | text-to-video |
| Libreria declarada | minimax-h3 |
| Modelos base | MiniMaxAI/MiniMax-H3; FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree |
| Hash del parche | SHA-256 `5577a30b1a443c5f6d0ba923e11a0b5ae57cbf73aa64ae8d458d1c2feff16903` |

## Arquitectura y entrenamiento

La familia MiniMax H3 se materializa aqui como un DiT (Diffusion Transformer) en su variante FL2VA, distribuida por Comfy-Org en una version podada y cuantizada a INT8 con rotacion de convoluciones (ConvRot). Sobre esa base, FastVideo publico un checkpoint FastH3 VSA-DataFree que anade atencion dispersa de video (VSA) y un muestreo destilado de cuatro pasos. El parche de este repositorio no reentrena nada: expresa la diferencia entre ambos conjuntos de pesos como un LoRA de rango 64 y convierte a la topologia del DiT INT8 podado los tensores que un LoRA no puede representar, es decir, las compuertas de VSA y el AdaLN ajustado. Segun la model card, el parche se construyo con la herramienta `tools/models/fasth3_vsa_patch.py` del propio mmh3.

Como consecuencia, no se dispone de informacion sobre volumen de tokens, composicion del dataset, ni sobre si hubo etapas de RLHF, DPO u otro ajuste por preferencias: esos datos corresponderian a los modelos originales y no se detallan en la informacion proporcionada. La innovacion tecnica destacable es doble: el destilado a cuatro pasos de muestreo y el uso de atencion dispersa de video para reducir el coste cuadratico de la atencion sobre secuencias espacio-temporales largas. El repositorio tambien advierte de que, al contener tensores ajenos a un LoRA, herramientas distintas de mmh3 pueden no ser capaces de cargar el parche.

## Capacidades

- Generacion de video a partir de texto, con el pipeline declarado `text-to-video`.
- Generacion en cuatro pasos de muestreo (`--steps 4`), gracias al destilado del checkpoint FastH3 VSA-DataFree.
- Atencion dispersa de video (VSA), orientada a secuencias espacio-temporales largas.
- Inferencia con precision de atencion `int8-fp8` sobre un DiT cuantizado en INT8 y podado.
- Aplicacion como parche sobre un DiT concreto (`minimax_h3_fl2va_pruned_int8_convrot.safetensors`), mediante el flag `--patch` de mmh3.
- Generacion por lotes desde fichero de prompts (`--prompt-file prompt.txt`) y salida a MP4 (`--out out.mp4`).
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible (el modelo base es de generacion de video; no se documentan idiomas de prompt).
- Modo thinking, vision o audio: no disponible / no documentado en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de video texto-a-video en local: con cuatro pasos de muestreo y un DiT INT8 podado, el coste por clip se reduce lo suficiente como para iterar sobre prompts sin depender de una API externa.
- Aplicaciones creativas con requisitos de baja latencia: insercion de clips generados en herramientas de edicion o tableros de guion grafico, donde el tiempo de espera por toma es el factor limitante.
- Investigacion en destilado de modelos de difusion: el parche documenta como reducir la diferencia entre dos checkpoints a un LoRA de rango 64 mas tensores auxiliares, un patron reutilizable para estudiar destilacion a pocos pasos.
- Investigacion en cuantizacion: sirve como caso de estudio de un DiT INT8 ConvRot podado ejecutado con atencion int8-fp8, util para medir el impacto de la precision mixta en la calidad del video.
- Experimentacion con atencion dispersa de video: permite reproducir el comportamiento de VSA sobre el DiT podado sin necesidad de reentrenar.
- Reproducibilidad y auditoria de pesos: al publicarse el hash SHA-256 del parche, se puede verificar la integridad del artefacto antes de cargarlo en un pipeline de inferencia.
- Evaluacion comparativa interna: sirve para contrastar, en el mismo hardware, el modelo base de MiniMax H3 frente a su variante FastH3 de cuatro pasos y cuantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de calidad de video (FVD, CLIP-score, VBench u otras), ni comparativas numericas frente al modelo base. La busqueda web realizada para esta ficha no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio solo contiene los parches (2,7 GB), no el DiT ni el resto de componentes necesarios para generar, por lo que no puede deducirse de este repositorio la huella final en memoria.
- GPU recomendadas: no disponible. Al ejecutarse sobre un DiT INT8 podado con destilado a cuatro pasos, el perfil de memoria es inferior al del modelo base sin cuantizar, pero no se proporcionan cifras.
- Compatibilidad con GPU de consumo: no disponible; no se documenta en la informacion proporcionada.
- Opciones de despliegue: el unico entorno documentado es el motor mmh3 (CLI `mmh3 generate`). vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo de difusion de video, y la propia model card advierte de que herramientas distintas de mmh3 pueden no cargar el parche.
- Ficheros necesarios: el parche `minimax_h3_fasth3_vsa_datafree_patch_rank64.safetensors` se aplica sobre `diffusion_models/minimax_h3_fl2va_pruned_int8_convrot.safetensors` de Comfy-Org/MiniMax-H3.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Relacion con este repositorio | Tamano / formato | Licencia |
|---|---|---|---|---|
| yniw/MiniMax-H3-mmh3 | Parche (LoRA rango 64 + tensores VSA y AdaLN) | Objeto de esta ficha | 2,7 GB, safetensors | MiniMax H3 Community License Agreement |
| Comfy-Org/MiniMax-H3 (`minimax_h3_fl2va_pruned_int8_convrot.safetensors`) | DiT FL2VA podado y cuantizado | Modelo de destino del parche | INT8 ConvRot, safetensors | MiniMax H3 Community License Agreement |
| FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree | Derivado de MiniMax H3 con VSA y destilado a 4 pasos | Origen de las diferencias que el parche codifica | no disponible | no disponible en la informacion proporcionada |
| MiniMaxAI/MiniMax-H3 | Modelo base | Ancestro de todos los anteriores | no disponible | MiniMax H3 Community License Agreement |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparados en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. Tampoco se han identificado alternativas de otros fabricantes con datos verificables en esta busqueda.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el DiT podado de Comfy-Org y el motor mmh3 para funcionar. Cargarlo con otras herramientas puede fallar, ya que contiene tensores que un LoRA convencional no transporta.
- Sin evidencia de uso: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni validacion por terceros.
- Restricciones de licencia: se distribuye bajo la MiniMax H3 Community License Agreement. Las restricciones de uso de la seccion V y del anexo A (Acceptable Use Policy) se aplican a cualquier usuario de estos ficheros; conviene revisarlas antes de un uso comercial.
- Idiomas soportados no documentados: no se especifica que lenguas admiten los prompts, lo que puede afectar a la calidad con prompts en castellano.
- Riesgo de alucinacion visual: como todo modelo generativo de video, puede producir contenido incoherente, artefactos temporales o detalles fisicamente imposibles; no se han publicado evaluaciones al respecto.
- Sesgos: no disponible. No se documenta analisis de sesgos del modelo base ni del derivado.
- Dependencia de datos externos: el repositorio no incluye los pesos base ni los componentes de texto, por lo que la reproducibilidad completa depende de terceros (MiniMaxAI, Comfy-Org, FastVideo).
- Ausencia de garantias de calidad tras la conversion: la model card no reporta comparaciones de fidelidad entre el resultado del parche y el checkpoint FastH3 original.
- Fechas y versionado: el repositorio se creo y actualizo en septiembre de 2026; es un artefacto reciente y sujeto a cambios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yniw/MiniMax-H3-mmh3
- Motor de inferencia mmh3: https://github.com/niw/mmh3
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint FastH3 VSA-DataFree: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- DiT podado INT8 ConvRot de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Licencia (MiniMax H3 Community License Agreement): fichero LICENSE del repositorio
- Aviso legal: fichero NOTICE del repositorio
