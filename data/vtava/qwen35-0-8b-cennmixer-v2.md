# vtava/Qwen35-0.8B-CeNNMixer-v2

## Resumen

Qwen35-0.8B-CeNNMixer-v2 es un experimento de investigación publicado por el usuario vtava (vtavakkoli) en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una modificación quirúrgica sobre Qwen/Qwen3.5-0.8B: se sustituye el mezclador de secuencia (sequence mixer) de la capa 0, originalmente un mecanismo de atención lineal, por un módulo recurrente denominado CeNN (presumiblemente una red neuronal celular, según los tags `cenn`, `recurrent` y `tinycenn`). El resto de componentes de Qwen (embeddings, RMSNorm, FFN y LM head) permanecen intactos.

El objetivo declarado es un experimento de "reemplazo progresivo" mediante destilación: durante el entrenamiento se congela el mezclador original de Qwen y se aplica un calendario de pesos alpha de [0.0, 0.5, 1.0], de forma que CeNN va tomando el control gradualmente hasta que, en alpha=1, el mezclador original se elimina por completo. Con ello se busca reducir el número de parámetros del mezclador en un 37,46 % (de 10.543.264 a 6.593.584 parámetros) manteniendo el comportamiento del modelo original.

La relevancia de esta ficha es limitada en términos prácticos: el repositorio ocupa 0,0 GB (no contiene pesos publicados), acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y la propia model card indica que no supera el "strict quality gate" (la métrica Top-1 agreement se queda en 0,406). Se trata, por tanto, de un artefacto de investigación reproducible en su metodología, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5 con el sequence mixer de la capa 0 sustituido por un modulo CeNN recurrente (arquitectura hibrida parcial) |
| Parametros totales | No disponible con exactitud; el modelo base Qwen/Qwen3.5-0.8B ronda los 0,8 mil millones. La sustitucion reduce el total en 3.949.680 parametros (10.543.264 del mixer original sustituidos por 6.593.584 de CeNN) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (no se publican pesos ni variantes cuantizadas) |
| Idiomas soportados | No disponible (heredados del modelo base, sin confirmar en la model card) |
| Licencia | No disponible |
| Formato de pesos | No disponible; el repositorio ocupa 0,0 GB y no contiene artefactos de pesos (safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.5-0.8B. Sobre ella se interviene unicamente en la capa 0: el mezclador original es de tipo `linear_attention` (según el campo `original mixer types` de la model card) y se reemplaza por un modulo CeNN recurrente de 6.593.584 parametros, frente a los 10.543.264 del mixer sustituido. Los embeddings, las capas RMSNorm, las FFN y la LM head no se modifican. El resultado es un modelo hibrido en el que solo una capa usa el mecanismo recurrente, mientras el resto de la red mantiene la topologia original de Qwen.

El entrenamiento se plantea como una destilacion progresiva: el mezclador original de Qwen permanece congelado y actua como profesor, mientras CeNN aprende a reproducir su comportamiento. El calendario de alpha ([0.0, 0.5, 1.0]) controla en que momento el mezclador congelado deja de intervenir y CeNN asume el control completo; en alpha=1 el mezclador original se elimina fisicamente. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El proyecto asociado es TinyCeNN-LM, alojado en GitHub.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base Qwen3.5-0.8B y canalizada a traves de la pipeline `text-generation`.
- Capacidad de modelado de secuencias largas potencialmente mejorada por el caracter recurrente del modulo CeNN, aunque no se aportan mediciones al respecto.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta thinking mode, vision, audio ni ninguna otra modalidad adicional.
- Capacidades multilingues: no disponibles.
- El modelo no supera el "strict quality gate" definido por el autor, por lo que sus capacidades generativas deben considerarse degradadas respecto al modelo base.

## Casos de uso

- Investigacion sobre sequence mixers recurrentes: el modelo permite estudiar como se comporta un modulo CeNN al sustituir una atencion lineal en una capa concreta de un transformer preentrenado, con metricas de acuerdo (Top-1 agreement de 0,406) y divergencia KL (1,607) ya publicadas como punto de partida.
- Experimentos de destilacion progresiva: el calendario alpha de [0.0, 0.5, 1.0] es un caso de estudio reproducible para investigar tecnicas de "progressive takeover" en las que un modulo alumno reemplaza gradualmente a un modulo profesor congelado.
- Reduccion de parametros en capas de atencion: con una rebaja del 37,46 % en los parametros del mixer, sirve para medir el impacto de comprimir mecanismos de atencion lineal en modelos pequenos.
- Ablaciones academicas capa a capa: al afectar solo a la capa 0, es util para aislar el efecto de un unico mixer modificado frente al resto de la red inalterada.
- Docencia y divulgacion tecnica: ilustra de forma concreta la diferencia entre atencion lineal, recurrencia y mezcladores de secuencia en una arquitectura moderna.
- Reproduccion de la metodologia TinyCeNN-LM: el repositorio de GitHub asociado permite extender el experimento a otras capas o a otros modelos base.
- No se recomienda su uso en produccion, atencion al cliente, generacion de codigo ni pipelines de CI/CD, dado que no hay pesos publicados, no hay licencia declarada y el propio autor marca el resultado como fallido en su control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card unicamente reporta las metricas internas del proceso de sustitucion, que miden el grado de acuerdo con el profesor y no la calidad absoluta del modelo:

| Metrica | Valor |
|---|---|
| Top-1 agreement con Qwen | 0,406250 |
| KL vs Qwen | 1,607330 |
| Hidden MSE | 0,895464 |
| Student CE | 6,039425 |
| Teacher CE | 4,800741 |
| Strict quality gate | False (no superado) |

La diferencia entre la entropia cruzada del alumno (6,039) y la del profesor (4,801) es de 1,239 puntos, coherente con una destilacion incompleta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Para un modelo de orden 0,8 B de parametros, las estimaciones habituales serian del orden de 1,6-2 GB en FP16 y 0,5-1 GB en cuantizacion de 4 bits, pero estas cifras no estan confirmadas para este modelo concreto.
- GPU recomendadas: no disponibles. Cualquier GPU consumer con 4 GB o mas de VRAM seria teoricamente suficiente para un modelo de este tamano, pero al no publicarse pesos no puede verificarse.
- Compatibilidad con GPU consumer: probable en teoria por tamano, pero no verificable; el repositorio no contiene artefactos de pesos (0,0 GB).
- Opciones de despliegue: no disponibles. La sustitucion del mixer por un modulo CeNN implica codigo personalizado, por lo que es previsible que requiera `transformers` con implementacion propia y no sea compatible directamente con vLLM, llama.cpp, Ollama o TGI sin adaptacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros del mixer de la capa 0 | Modificacion | Licencia | Pesos publicados |
|---|---|---|---|---|
| vtava/Qwen35-0.8B-CeNNMixer-v2 | 6.593.584 (CeNN recurrente) | Capa 0 sustituida | No disponible | No |
| Qwen/Qwen3.5-0.8B (modelo base) | 10.543.264 (linear_attention) | Ninguna | No disponible en la informacion proporcionada | Si (repositorio oficial) |
| Otros modelos con mezcladores recurrentes o hibridos de tamano comparable | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos alternativos equivalentes en la informacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva este experimento.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no supera el "strict quality gate": el Top-1 agreement con el profesor es de 0,406, es decir, menos de la mitad de las predicciones coinciden con las de Qwen.
- La divergencia KL de 1,607 y el Hidden MSE de 0,895 indican una desviacion significativa respecto al comportamiento del modelo original.
- La entropia cruzada del alumno (6,039) es notablemente superior a la del profesor (4,801), lo que anticipa una mayor tasa de errores y de alucinaciones en la generacion.
- Solo se sustituye la capa 0: el modelo sigue dependiendo mayoritariamente de Qwen3.5-0.8B, por lo que hereda sus sesgos y sus limitaciones, sin que se documente ningun proceso de alineacion adicional.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. Ademas, al derivar de Qwen3.5-0.8B, las condiciones del modelo base podrian aplicar y no se detallan.
- No se declaran idiomas soportados ni longitud de contexto.
- El repositorio no contiene pesos (0,0 GB), por lo que el modelo no es desplegable tal cual desde HuggingFace.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y fue creado en septiembre de 2026; no hay evidencia de uso o validacion por terceros.
- Al incorporar un modulo CeNN recurrente, es probable que requiera codigo personalizado para su carga, lo que complica su integracion en stacks estandar de inferencia.
- No debe utilizarse en entornos de produccion, aplicaciones orientadas a usuarios ni tareas en las que la precision sea critica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vtava/Qwen35-0.8B-CeNNMixer-v2
- Proyecto TinyCeNN-LM en GitHub: https://github.com/vtavakkoli/TinyCeNN-LM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos enlaces recuperados correspondian a paginas genericas de YouTube, sin relacion con el contenido de la ficha.
