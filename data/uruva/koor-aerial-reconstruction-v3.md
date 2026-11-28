# Uruva/Koor-aerial-reconstruction-v3

## Resumen

Koor-aerial-reconstruction-v3 es un adaptador PEFT LoRA desarrollado por Uruva sobre el modelo base Qwen/Qwen3-VL-2B-Instruct (revision `89644892e4d85e24eaac8bacfd4f463576704203`). Su funcion es convertir una fotografia aerea junto con una mascara de huella de edificio en una representacion geometrica 3D expresada como JSON de triangulos en coordenadas locales Y-up y unidades en milimetros. Un conversor de geometria propio del proyecto, denominado Koor, transforma ese JSON valido en una malla de Three.js.

El adaptador se entrena durante una sola epoca sobre 782 edificios neerlandeses, con la funcion de perdida aplicada al JSON de geometria y al token de fin de asistente. Es un modelo de nicho orientado a la reconstruccion de edificios a partir de imagery aerea, no un modelo de proposito general. El repositorio tiene un tamano de 0,0 GB, lo que es coherente con un adaptador LoRA ligero que solo contiene los pesos delta sobre el modelo base de 2B parametros.

La relevancia de este modelo radica en su enfoque: usar un VLM compacto (2B) con un adaptador especializado para producir geometria 3D estructurada en lugar de texto libre, lo que facilita su integracion en pipelines de visualizacion web mediante Three.js. No obstante, la calidad de malla en conjuntos de validacion aun no se ha medido segun la propia model card, por lo que debe considerarse un artefacto en fase experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-VL-2B-Instruct; el modelo base es un transformer multimodal vision-lenguaje |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-VL-2B-Instruct tiene 2B parametros (dato del nombre del modelo base, no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de tipo PEFT que se aplica sobre Qwen3-VL-2B-Instruct, un modelo base multimodal de vision y lenguaje. El adaptador no modifica la arquitectura del transformer subyacente; anade matrices de bajo rango entrenables que ajustan el comportamiento del modelo base para la tarea especifica de reconstruccion de geometria de edificios. La salida esperada es un JSON con triangulos en coordenadas locales Y-up y unidades en milimetros, que posteriormente se convierte en una malla Three.js mediante el conversor Koor.

El entrenamiento se realizo durante una epoca sobre 782 edificios neerlandeses. La perdida se calculo sobre el JSON de geometria y sobre el token de fin de asistente. Los datos de entrenamiento provienen del dataset Uruva/Koor-v3-3DBAG-PDOK, que combina datos de 3DBAG (© tudelft3d y 3DGI) e imagery aerea de 2024 del Samenwerkingsverband Beeldmateriaal via PDOK, ambos bajo licencia CC BY 4.0. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La model card indica explicitamente que la calidad de malla en conjuntos de validacion aun no se ha medido para este adaptador.

## Capacidades

- Reconstruccion de geometria 3D de edificios a partir de una imagen aerea y una mascara de huella, produciendo triangulos en JSON con coordenadas locales Y-up en milimetros.
- Generacion de geometria estructurada en formato JSON, lo que permite validacion programatica y conversion a mallas Three.js mediante el conversor Koor.
- Capacidades heredadas del modelo base Qwen3-VL-2B-Instruct en vision y lenguaje (no detalladas en la informacion proporcionada).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: salida de geometria 3D estructurada para visualizacion web; no se mencionan modos de pensamiento, audio ni otras capacidades especiales.

## Casos de uso

- Visualizacion web de edificios en 3D: el modelo genera JSON de triangulos que el conversor Koor transforma en una malla Three.js, lo que permite renderizar edificios reconstruidos directamente en el navegador sin necesidad de un pipeline de fotogrametria completo.
- Generacion de gemelos digitales urbanos a partir de imagery aereo: dado un vuelo fotogrametrico y las huellas de edificios, el adaptador puede producir geometria simplificada para entornos de simulacion o planificacion urbana.
- Enriquecimiento de datos catastrales: la mascara de huella actua como ancla geometrica y el modelo predice la elevacion y la forma del tejado, lo que puede complementar bases de datos 2D con informacion 3D.
- Prototipado rapido en SIG: integracion en flujos de trabajo de sistemas de informacion geografica donde se necesita una primera aproximacion volumetrica antes de un levantamiento detallado.
- Educacion y demostraciones de vision 3D: al ser un adaptador ligero sobre un modelo de 2B, puede desplegarse en entornos docentes para ilustrar la conversion de imagery a geometria estructurada.
- Investigacion en reconstruccion con VLMs: sirve como punto de partida para experimentar con adaptadores LoRA sobre modelos vision-lenguaje para tareas de geometria 3D, dado su bajo coste de entrenamiento (una epoca, 782 muestras).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la calidad de malla en conjuntos de validacion aun no se ha medido para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; al estar montado sobre Qwen3-VL-2B-Instruct, los requisitos vendran determinados por el modelo base y la cuantizacion elegida (no confirmados en la informacion proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; el tamano del modelo base (2B) sugiere que podria caber en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: la libreria indicada es PEFT, por lo que el adaptador se cargaria junto con el modelo base mediante la libreria PEFT de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni de modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- La calidad de malla en conjuntos de validacion aun no se ha medido segun la model card, por lo que el rendimiento real en produccion es desconocido.
- El entrenamiento se limita a 782 edificios neerlandeses y una sola epoca, lo que puede provocar un ajuste deficiente o escasa generalizacion a otras regiones, tipologias de edificio o condiciones de imagery.
- La licencia no esta disponible, lo que impide confirmar si se permite el uso comercial del adaptador.
- Los datos de entrenamiento incluyen 3DBAG (CC BY 4.0) e imagery de PDOK (CC BY 4.0); es necesario respetar las atribuciones correspondientes si se redistribuye el modelo o se derivan obras.
- Riesgo de alucinacion geometrica: al ser un modelo generativo, puede producir JSON de triangulos invalidos o geometricamente inconsistentes; se requiere validacion programatica antes de la conversion a malla.
- Dependencia del modelo base Qwen3-VL-2B-Instruct en la revision especificada; cambios de revision pueden alterar el comportamiento del adaptador.
- No se especifican sesgos conocidos ni limitaciones de contexto o idioma en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uruva/Koor-aerial-reconstruction-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Uruva/Koor-v3-3DBAG-PDOK
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
