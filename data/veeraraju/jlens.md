# Veeraraju/jlens

## Resumen

`Veeraraju/jlens` no es un modelo de lenguaje generativo, sino una coleccion de artefactos de interpretabilidad: lentes jacobianas (J-Lens) y J++ Lenses ajustadas sobre distintos modelos base. Una J-Lens es una transformacion lineal por capa que aproxima la contribucion del jacobiano de la red, permitiendo proyectar estados ocultos intermedios al espacio de vocabulario y observar que token predice el modelo en cada capa. El repositorio lo publica Veeraraju siguiendo los protocolos y el codigo publicados por el equipo de Salesforce, con una estructura de directorios que replica el arbol estandar `{slug}/{jlens|jpp}/Salesforce-wikitext/`.

El paquete cubre cuatro modelos base: `cedar` (un Llama-3.3-70B orientado a sandbagging), `llama-3.1-8b-it`, `mistral-small-3.1-24b-it` y `glm-4.7-flash`. Tres de las lentes se ajustan con el metodo J-Lens clasico sobre WikiText-103 (Salesforce-wikitext) con `max_seq_len=128`, mientras que la de `glm-4.7-flash` emplea la variante J++ con 8 expertos y `lrp_mode=r+experts`, apropiada para arquitecturas MoE. El numero de prompts de ajuste varia entre 64 y 1000 segun el caso.

Su relevancia es practica para investigadores en interpretabilidad mecanicista: permiten inspeccionar la evolucion de la prediccion capa a capa, detectar comportamientos anomalos como el sandbagging y auditar modelos de distintos proveedores sin reajustar las lentes. El repo ocupa 14,5 GB, coherente con matrices por capa para modelos de hasta 70B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefactos de interpretabilidad (J-Lens y J++ Lens) sobre transformers y MoE; no es un modelo generativo |
| Parametros totales | No aplica al artefacto; los modelos base van de 8B a 70B |
| Parametros activos | No disponible (el unico base MoE es `glm-4.7-flash`, sin detalle de parametros activos) |
| Longitud de contexto | `max_seq_len=128` en el ajuste de todas las lentes |
| Tipos de cuantizacion | No disponible (los ficheros son `.pt` de PyTorch, no pesos cuantizados) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch), con libreria `jlens` |
| Modelos base cubiertos | `cedar` (Llama-3.3-70B), `llama-3.1-8b-it`, `mistral-small-3.1-24b-it`, `glm-4.7-flash` |
| Dataset de ajuste | WikiText-103 (Salesforce-wikitext) |
| Prompts de ajuste | 64, 231, 302 y 1000 segun la lente |
| Tamano del repo | 14,5 GB |
| Pipeline | `other` |

## Arquitectura y entrenamiento

Cada lente es una matriz por capa que aproxima el jacobiano de la funcion del modelo respecto a las activaciones, de modo que al multiplicar un estado oculto por ella se obtiene una distribucion sobre el vocabulario equivalente a la que produciria la red si se truncara en esa capa. El ajuste se realiza con el codigo publicado por Salesforce y protocolos estandar sobre WikiText-103, con `max_seq_len=128` y un `dim_batch` que varia por modelo (8 para `cedar`, 32 para `llama-3.1-8b-it`, 4 para `mistral-small-3.1-24b-it`). En `cedar` el ajuste se detuvo manualmente en 231 prompts pese a haberse solicitado 1000, lo que reduce la cobertura estadistica de esa lente.

La lente de `glm-4.7-flash` usa la variante J++ con 8 expertos y `lrp_mode=r+experts`, disenada para modelos con mezcla de expertos: en lugar de una unica proyeccion, combina la contribucion de varios expertos mediante reglas de propagacion de relevancia. No se documentan fases de RLHF ni DPO porque no se entrena un modelo de lenguaje, sino un instrumento de analisis. Tampoco se especifica el numero de tokens de entrenamiento ni la composicion completa del corpus mas alla de WikiText-103.

## Capacidades

- Proyeccion logit-lens por capa: permite leer la prediccion del modelo en cada nivel de profundidad sin ejecutar el forward completo.
- Aproximacion jacobiana: captura la sensibilidad de la salida final respecto a activaciones intermedias, mas fiel que una logit-lens lineal simple.
- Variante J++ para MoE: soporta modelos con mezcla de expertos mediante propagacion de relevancia con `lrp_mode=r+experts` y 8 expertos.
- Cobertura multi-modelo: lentes para Llama-3.1-8B-Instruct, Mistral-Small-3.1-24B-Instruct, GLM-4.7-flash y `cedar` (Llama-3.3-70B).
- Analisis de sandbagging: la lente de `cedar` esta pensada para estudiar comportamiento deliberadamente degradado en evaluaciones.
- No incluye generacion de texto, tool calling, agentes ni capacidades multimodales: es exclusivamente un artefacto de analisis.

## Casos de uso

- Interpretabilidad mecanicista por capas: cargar la lente de `llama-3.1-8b-it` y proyectar estados ocultos en cada capa para trazar como evoluciona la prediccion de un token a lo largo de la red, util para estudiar circuitos y representaciones.
- Deteccion de sandbagging: usar la lente de `cedar` para comparar la prediccion interna con la salida observada y detectar discrepancias compatibles con degradacion intencionada del rendimiento.
- Auditoria de modelos de terceros: aplicar las lentes de Mistral y GLM para inspeccionar modelos cerrados o de pesos abiertos sin reajustar proyecciones, comparando el comportamiento interno entre proveedores.
- Investigacion en MoE: emplear la lente J++ de `glm-4.7-flash` para analizar como contribuyen los expertos a la prediccion final en cada capa.
- Docencia y divulgacion: ilustrar el funcionamiento interno de un transformer mostrando predicciones intermedias con una lente preajustada y sin coste de entrenamiento.
- Reproducibilidad de experimentos: servir como referencia precalculada para validar implementaciones propias del codigo de Salesforce sobre WikiText-103 con los mismos hiperparametros (`max_seq_len=128`, `dim_batch` documentado).
- Analisis de sesgos en el vocabulario: examinar que tokens refuerza el modelo en capas tempranas frente a tardias para estudiar sesgos de representacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para cargar la lente: depende del modelo base; las matrices por capa de un modelo de 70B requieren del orden de decenas de GB, mientras que las de 8B caben en GPU de consumo.
- GPU recomendadas: A100 o H100 de 80 GB para las lentes de `cedar` y `mistral-small-3.1-24b-it`; RTX 4090 (24 GB) suficiente para `llama-3.1-8b-it` si se carga el modelo base en precision reducida.
- GPU de consumo: viable para el modelo base de 8B y su lente; no para el de 70B sin cuantizacion u offloading.
- Despliegue: la libreria `jlens` carga los ficheros `.pt`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo servible.
- Latencia y throughput: no disponible.
- Almacenamiento: el repo completo ocupa 14,5 GB; conviene descargar solo el subdirectorio del modelo de interes.

## Comparativa con modelos similares

| Artefacto | Modelos base cubiertos | Variante | Prompts de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Veeraraju/jlens` | cedar, Llama-3.1-8B, Mistral-Small-3.1-24B, GLM-4.7-flash | J-Lens y J++ | 64-1000 | Apache 2.0 | Hugging Face |
| Lentes de Salesforce (referencia del protocolo) | No disponible en la informacion | J-Lens | No disponible | No disponible | Codigo publicado por Salesforce |
| Logit-lens clasica | Cualquier transformer | Lineal simple | No aplica | Segun implementacion | Multiples repositorios |
| Tuned Lens | Cualquier transformer | Afin por capa | Dataset propio | Segun implementacion | Multiples repositorios |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede desplegarse como servicio de inferencia; usarlo como tal es un error de categoria.
- Cobertura estadistica desigual: la lente de `cedar` se ajusto con solo 231 prompts tras detener manualmente un objetivo de 1000, lo que puede introducir mayor varianza.
- Contexto limitado: todas las lentes se ajustaron con `max_seq_len=128`, por lo que su fidelidad mas alla de esa longitud no esta validada.
- Solo ingles: el corpus de ajuste es WikiText-103 en ingles; el comportamiento en otros idiomas no esta caracterizado.
- Dependencia de version del modelo base: la lente solo es valida para la revision exacta del modelo con la que se ajusto; cambios en pesos o tokenizer invalidan la proyeccion.
- Sin validacion publicada: no hay benchmarks ni evaluaciones de fidelidad de las lentes en la informacion disponible, y el repo registra 0 descargas y 0 likes.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el uso de los modelos base subyacentes queda sujeto a sus propias licencias.
- Riesgo de interpretacion erronea: una lectura logit-lens no equivale al mecanismo causal real del modelo; las conclusiones deben contrastarse con intervenciones como ablaciones o patching.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Veeraraju/jlens
- Lente de cedar: https://huggingface.co/Veeraraju/jlens/resolve/main/cedar/jlens/Salesforce-wikitext/cedar_jacobian_lens_n231.pt
- Lente de Llama-3.1-8B-Instruct: https://huggingface.co/Veeraraju/jlens/resolve/main/llama-3.1-8b-it/jlens/Salesforce-wikitext/Llama-3.1-8B-Instruct_jacobian_lens_n302.pt
- Lente de Mistral-Small-3.1-24B-Instruct: https://huggingface.co/Veeraraju/jlens/resolve/main/mistral-small-3.1-24b-it/jlens/Salesforce-wikitext/Mistral-Small-3.1-24B-Instruct-2503_jacobian_lens_n1000.pt
- Lente J++ de GLM-4.7-flash: https://huggingface.co/Veeraraju/jlens/resolve/main/glm-4.7-flash/jpp/Salesforce-wikitext/glm-4.7-flash_jpp_lens_n64.pt
- Modelo base cedar (sandbagging): https://huggingface.co/sandbagging-games/cedar
