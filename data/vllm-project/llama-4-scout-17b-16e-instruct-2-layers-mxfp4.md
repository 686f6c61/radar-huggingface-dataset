# vllm-project/Llama-4-Scout-17B-16E-Instruct-2-layers-mxfp4

## Resumen

Este repositorio aloja una copia de un checkpoint derivado de Llama 4 Scout, el modelo Mixture-of-Experts (MoE) multimodal de Meta publicado en 2025. Concretamente, se trata de una version truncada a solo 2 capas del modelo original, cuantizada en MXFP4, y publicada por el equipo de vLLM como artefacto de integracion continua (CI). No es un modelo pensado para uso en produccion ni para inferencia real, sino una pieza de test que el proyecto vLLM emplea para validar su soporte de Llama 4, del formato de cuantizacion MXFP4 y de la carga de checkpoints MoE.

El checkpoint original del que deriva pertenece a la familia Llama 4 de Meta, distribuida bajo la Llama 4 Community License. Llama 4 Scout es un modelo MoE con 17.000 millones de parametros activos y 16 expertos, de ahi la nomenclatura "17B-16E", y una ventana de contexto declarada de hasta 10 millones de tokens en su configuracion completa. La variante aqui alojada, sin embargo, conserva unicamente 2 capas y unos 4.440 millones de parametros totales, segun los pesos en safetensors del repositorio.

Su relevancia es fundamentalmente tecnica: sirve como referencia para desarrolladores que quieran inspeccionar como se estructura un checkpoint Llama 4 cuantizado en MXFP4 (formato de coma flotante de 4 bits con escala por bloque, definido en el estandar OCP), o para reproducir los tests de vLLM. No debe confundirse con el modelo Llama 4 Scout completo ni utilizarse como sustituto de este en ninguna aplicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (derivada de Llama 4 Scout, truncada a 2 capas) |
| Parametros totales | 4.444.165.632 (checkpoint truncado; el modelo completo declara 17B activos / 16 expertos) |
| Parametros activos | no disponible en este checkpoint truncado |
| Longitud de contexto | no disponible (el modelo original declara hasta 10M tokens) |
| Tipos de cuantizacion | MXFP4 (4 bits, escala por bloque) |
| Idiomas soportados | no disponible |
| Licencia | llama4 (Llama 4 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,9 GB |
| Tags | safetensors, llama4, quark, region:us |
| Descargas | 18 |
| Fecha de creacion | 2026-10-30 |

## Arquitectura y entrenamiento

El checkpoint deriva de Llama 4 Scout, un transformer con capas de atencion y mezcla de expertos (MoE) en las capas feed-forward. La nomenclatura "16E" indica 16 expertos por capa MoE, de los cuales se activa un subconjunto por token; el modelo original declara 17.000 millones de parametros activos sobre un total mucho mayor. Llama 4 Scout incorpora ademas capacidades multimodales (entrada de imagen y texto) en su version completa, aunque este repositorio no documenta si conserva el proyector de vision tras el truncamiento.

Este repositorio concreto no contiene informacion sobre el dataset de entrenamiento, el numero de tokens procesados, ni las fases de alineacion (RLHF, DPO) del modelo original. Tampoco documenta si el truncamiento a 2 capas se realizo preservando los pesos de la torre de vision o solo las capas del lenguaje. La innovacion tecnica relevante aqui es la cuantizacion MXFP4: un formato de 4 bits con un exponente compartido por bloque de 32 elementos, definido en el estandar Open Compute Project, que reduce el peso del checkpoint aproximadamente a un cuarto del de una version en BF16. El tag `quark` sugiere que la cuantizacion se genero con la herramienta Quark de AMD, coherente con el origen del checkpoint original en la cuenta `mawong-amd`.

## Capacidades

- Generacion de texto autoregresiva: el checkpoint conserva la estructura de un modelo de lenguaje, aunque con solo 2 capas su calidad generativa es practicamente nula.
- Soporte de cuantizacion MXFP4: valida la ruta de carga y ejecucion de pesos de 4 bits en vLLM.
- Compatibilidad con el parser de checkpoints Llama 4: sirve para probar la logica de carga de configuraciones MoE con 16 expertos.
- Capacidades multimodales: no disponible en este checkpoint truncado; el modelo original soporta entrada de imagen.
- Tool calling y function calling: no disponible.
- Razonamiento multi-paso y modo thinking: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Test de integracion en vLLM: el checkpoint se usa en la suite de CI del proyecto para verificar que el motor carga correctamente pesos Llama 4 cuantizados en MXFP4 sin errores de forma ni de dispatcher de kernels.
- Validacion de kernels MXFP4: permite comprobar en un entorno controlado que los kernels de cuantizacion de 4 bits producen resultados coherentes con la implementacion de referencia, sin necesidad de descargar el modelo completo de decenas de gigabytes.
- Desarrollo de herramientas de conversion: sirve como muestra real de la estructura de tensores de un checkpoint Llama 4 truncado, util para escribir scripts de conversion a GGUF u otros formatos.
- Pruebas de pipeline de despliegue: al ocupar 6,9 GB, cabe en una GPU consumer y permite ensayar flujos de arranque, carga y apagado de servidores de inferencia sin consumir recursos de un modelo completo.
- Reproducibilidad de supply chain: al ser una copia mantenida por la organizacion vllm-project, reduce el riesgo de que el artefacto original desaparezca o cambie, algo relevante para pipelines de CI que deben ser deterministas.
- Investigacion sobre truncamiento de modelos: permite estudiar como se comporta un modelo MoE cuando se eliminan capas, comparando la salida de las 2 capas conservadas con la del modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 6,9 GB en MXFP4, por lo que la carga completa requiere al menos unos 8 GB de VRAM, mas el overhead de activaciones y del runtime de vLLM.
- GPU recomendadas: cualquier GPU con soporte de MXFP4 en vLLM; para pruebas de CI basta una GPU consumer moderna. Para el modelo Llama 4 Scout completo se requeririan configuraciones multi-GPU de alta gama (H100, A100 80 GB o superiores), pero este checkpoint truncado no las necesita.
- Cabe en GPU consumer: si, en tarjetas con 8-12 GB de VRAM como una RTX 3060 de 12 GB o una RTX 4070.
- Opciones de despliegue: vLLM es el runtime de referencia para este checkpoint; llama.cpp y Ollama no estan documentados para este formato MXFP4 concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso previsto |
|---|---|---|---|---|---|
| vllm-project/Llama-4-Scout-17B-16E-Instruct-2-layers-mxfp4 | 4,44B (truncado) | no disponible | MXFP4 | llama4 | Test de CI |
| mawong-amd/Llama-4-Scout-17B-16E-Instruct-2-layers-mxfp4 | 4,44B (truncado) | no disponible | MXFP4 | llama4 | Test de CI (original) |
| meta-llama/Llama-4-Scout-17B-16E-Instruct | 17B activos / 16 expertos | hasta 10M | BF16 y otras | llama4 | Inferencia en produccion |
| Llama 3.1 8B Instruct | 8B densos | 128K | BF16, GGUF, AWQ, etc. | llama3.1 | Inferencia general |

La comparativa relevante es con el modelo completo del que deriva: este checkpoint no es funcionalmente equivalente a Llama 4 Scout, ya que la eliminacion de capas destruye la calidad del modelo. Frente a Llama 3.1 8B, la diferencia principal es que aquel es un modelo denso desplegable en produccion, mientras que este es un artefacto de prueba.

## Limitaciones y advertencias

- Modelo truncado a 2 capas: la calidad de generacion es practicamente nula; no debe usarse para ninguna tarea de inferencia real.
- Artefacto de CI: el autor lo publica explicitamente como copia para reducir riesgo de supply chain en los tests de vLLM, no como modelo distribuible.
- Sin model card propia: el README solo indica el origen y el commit de la copia; no hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones.
- Idiomas no documentados: se desconoce que cobertura linguistica conserva el checkpoint truncado.
- Licencia Llama 4 Community License: impone restricciones de uso comercial, requisitos de atribucion y clausulas de escala (usuarios mensuales) que deben revisarse antes de cualquier redistribucion.
- Riesgo de confusion: el nombre incluye "17B-16E" pero los pesos reales suman 4,44B por el truncamiento; automatizaciones que infieran el tamano a partir del nombre pueden fallar.
- Sin garantias de soporte: al ser un checkpoint de test, vLLM puede modificarlo o eliminarlo sin aviso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vllm-project/Llama-4-Scout-17B-16E-Instruct-2-layers-mxfp4
- Checkpoint original copiado: https://huggingface.co/mawong-amd/Llama-4-Scout-17B-16E-Instruct-2-layers-mxfp4
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Modelo Llama 4 Scout de Meta: https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct
- Blog de Meta sobre Llama 4: https://ai.meta.com/blog/llama-4-multimodal-intelligence/
- Herramienta de cuantizacion Quark (AMD): https://github.com/amd/quark
- Estandar MXFP4 (Open Compute Project): https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf
