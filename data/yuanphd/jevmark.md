# yuanphd/jevmark

## Resumen

jevmark es una coleccion de adaptadores LoRA que implementan un modelo de decision discriminativo: no genera texto, sino que recibe un estado textual y un conjunto de preguntas tipadas, y devuelve en una sola pasada una distribucion de probabilidad por pregunta. Las opciones de respuesta forman parte de cada peticion (preguntas de si/no, eleccion entre opciones dadas o niveles de una escala definida en la propia peticion), de modo que el modelo lee las etiquetas en lugar de memorizar un conjunto fijo. Lo desarrolla el autor yuanphd como reimplementacion independiente del concepto de Jev, el modelo propietario de TypeSafe AI, y lo publica bajo licencia Apache 2.0.

El repositorio contiene tres adaptadores entrenados sobre modelos base de la familia Qwen3: `sft_06b` (Qwen3-0.6B-Base) y `sft_17b` (Qwen3-1.7B-Base), que son el modelo de decision general entrenado con SFT sobre CLINC150 y SST-5, y `rlcd_banking77_06b` (Qwen3-0.6B-Base), adaptado a Banking77 con una perdida Brier pathwise a partir de 5.000 interacciones de despliegue en las que solo se revela la correccion de la propia respuesta elegida, sin etiquetas (RLCD). Los adaptadores usan LoRA con r=16 y alpha=32 sobre las proyecciones q, k, v y o, y el repositorio completo ocupa 0,1 GB.

La relevancia del proyecto esta en que aborda un caso de uso distinto al de los LLM generativos: clasificacion y decision con probabilidades calibradas y coste de inferencia muy bajo, midiendo ademas la calibracion (ECE) y en que situaciones ayuda el aprendizaje por refuerzo con recompensas basadas en la correccion. El modelo solo soporta ingles y su API se distribuye mediante la libreria Python `jevmark`, instalada desde GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (r=16, alpha=32, en q, k, v, o) sobre transformer decoder Qwen3 |
| Parametros totales | 0,6 mil millones (Qwen3-0.6B-Base) o 1,7 mil millones (Qwen3-1.7B-Base) del backbone; los adaptadores LoRA ocupan 0,1 GB en total |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se define en el `config.yaml` de cada adaptador, no se especifica el valor) |
| Tipos de cuantizacion | no disponible (solo se publican adaptadores LoRA en safetensors; no hay pesos cuantizados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) con `adapter_config.json`; libreria PEFT |

## Arquitectura y entrenamiento

jevmark no es un modelo generativo autonomo, sino un conjunto de adaptadores PEFT sobre dos backbones Qwen3 Base. Cada adaptador es un LoRA de rango 16 y alpha 32 aplicado a las proyecciones q, k, v y o. La inferencia consiste en codificar la peticion junto con las opciones de respuesta y leer la distribucion de probabilidad en los logits de las letras correspondientes a cada slot de respuesta. Los adaptadores se publican tal y como se evaluaron, con `temperature` a 1.0 en `calibration.json`, sin temperatura ajustada por defecto.

El entrenamiento de los adaptadores generales (`sft_06b` y `sft_17b`) es SFT sobre preguntas derivadas de CLINC150 (intenciones) y SST-5 (escala de sentimiento). El tercer adaptador, `rlcd_banking77_06b`, parte de `sft_06b` y se adapta a Banking77 mediante RLCD: una perdida Brier pathwise entrenada sobre 5.000 interacciones registradas en despliegue en las que solo se conocia si la respuesta elegida por el propio modelo era correcta, sin etiquetas doradas. Cada adaptador incluye `config.yaml` con el backbone y su revision fijada, la longitud de codificacion y los ajustes de entrenamiento, y tiene un hash sha256 publicado para el fichero de pesos. La procedencia de cada adaptador se documenta como un directorio concreto del repositorio de GitHub en un commit determinado.

## Capacidades

- Modelo de decision discriminativo: devuelve una distribucion de probabilidad por pregunta, no texto generado.
- Preguntas de si/no (`noul`), de eleccion entre opciones (`choice`) y de nivel en una escala definida en la peticion.
- Las opciones de respuesta se leen de la peticion, por lo que no depende de un conjunto fijo de etiquetas memorizado.
- Devuelve ademas una medida de confianza: 1 - H(p) / ln K para preguntas de eleccion y de puntuacion.
- Clasificacion de intenciones (CLINC150, incluidos intents no vistos en entrenamiento).
- Analisis de sentimiento por escala de 5 niveles (SST-5) y por escala de estrellas (Yelp).
- Clasificacion de temas de noticias (AG News), emociones y subconjuntos de intenciones bancarias (Banking77) como esquemas no vistos en entrenamiento.
- Adaptacion a dominios concretos a partir de logs de despliegue con senal de correccion, sin etiquetas (RLCD sobre Banking77).
- No soporta generacion de texto, tool calling, agentes, vision ni audio segun la informacion disponible.
- Solo ingles.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket y una pregunta `choice` con criterios como "billing", "technical" u "other", y devuelve la etiqueta elegida, la probabilidad por opcion y una confianza. Es el ejemplo incluido en la propia model card y se apoya en la lectura de opciones en la peticion.
- Deteccion de intencion en asistentes conversacionales: con una pregunta `choice` sobre intenciones estilo CLINC150, el modelo clasifica cada turno; en el split `test_indomain` alcanza 0,956 de accuracy con ECE 0,013 en `sft_06b`.
- Analisis de sentimiento por escala: usando preguntas de escala de 5 niveles (SST-5) o de estrellas (Yelp), el modelo devuelve una distribucion sobre los niveles; en SST-5 logra 0,773 (`sft_06b`) y 0,790 (`sft_17b`).
- Clasificacion de intenciones bancarias en produccion: el adaptador `rlcd_banking77_06b` se ajusta a Banking77 a partir de logs donde solo se sabe si la respuesta del modelo fue correcta, util cuando no hay etiquetas disponibles pero si trazas de uso real.
- Enrutado con umbral de confianza: dado que la API devuelve la distribucion y la confianza, la aplicacion puede derivar a un humano las peticiones de baja confianza; los umbrales y el enrutado son responsabilidad del llamante.
- Etiquetado automatizado de datos: la clasificacion de temas y emociones con esquemas nuevos (AG News, emotion) permite preetiquetar corpus, aunque con precision mas baja en esquemas no entrenados (0,788 y 0,628 en `sft_06b`).
- Sustitucion de LLM generativos en tareas de clasificacion: en un subconjunto de 500 registros, `sft_06b` y `sft_17b` obtienen 0,944 y 0,945 en dominio frente a 0,908 de gpt-4.1-mini, con latencias de decenas de milisegundos.
- Filtrado y triaje de bajo coste en pipelines: al ser adaptadores sobre backbones de 0,6 B y 1,7 B y no generar texto, la inferencia es mucho mas barata que la de un LLM generativo, lo que permite usarlo como primera etapa de clasificacion.

## Benchmarks y rendimiento

Accuracy / ECE en splits de test completos para `sft_06b` y `sft_17b` (ECE con 15 bins de igual anchura sobre la probabilidad top-1, en preguntas cuya respuesta depende de una etiqueta dorada):

| Split | Que evalua | sft_06b (acc / ECE) | sft_17b (acc / ECE) |
|---|---|---|---|
| test_indomain | Intenciones CLINC150 y preguntas si/no vistas en entrenamiento | 0,956 / 0,013 | 0,952 / 0,015 |
| test_unseen_intents | 20 intenciones CLINC150 nunca entrenadas | 0,892 / 0,068 | 0,897 / 0,070 |
| test_sst5 | Escala de sentimiento SST-5 y preguntas de sentimiento | 0,773 / 0,030 | 0,790 / 0,025 |
| test_agnews | Esquema no visto: tema de noticias | 0,788 / 0,164 | 0,847 / 0,113 |
| test_emotion | Esquema no visto: emocion | 0,628 / 0,207 | 0,645 / 0,217 |
| test_banking77 | Esquema no visto: subconjuntos de Banking77 de 10 opciones | 0,851 / 0,067 | 0,852 / 0,087 |
| test_yelp | Esquema no visto: escala de 5 estrellas | 0,505 / 0,169 | 0,527 / 0,218 |

Otros datos publicados:

| Metrica | sft_06b | sft_17b |
|---|---|---|
| Latencia mediana batch-1 en una T4 | 47,7 ms | 74,8 ms |
| Subconjunto de 500 registros, en dominio | 0,944 | 0,945 |
| Subconjunto de 500 registros, Banking77 | 0,846 | 0,850 |
| Temperatura ajustada en validacion en dominio | 1,266 | 1,321 |
| ECE en dominio tras aplicar temperatura | 0,005 | 0,003 |

Referencia externa en el mismo subconjunto de 500 registros: gpt-4.1-mini obtiene 0,908 en dominio y 0,918 en Banking77. Para `rlcd_banking77_06b`, el texto disponible sobre el split completo de test de Banking77 (3.080 registros) esta truncado en la informacion proporcionada, por lo que no se reproducen sus cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp16, aproximadamente 1,2 GB de pesos para el backbone de 0,6 B y 3,4 GB para el de 1,7 B, mas la cache KV y el overhead del runtime (estimacion a partir del numero de parametros; no publicada por el autor).
- GPU recomendadas: el autor reporta latencias medidas en una NVIDIA T4; cualquier GPU con al menos 4 GB de memoria es suficiente para el backbone de 0,6 B.
- Cabe en GPU de consumo: si, el adaptador de 0,6 B en tarjetas de gama media o baja (por ejemplo, RTX 3060 o GTX 1650 con 4 GB) y el de 1,7 B en tarjetas con 6-8 GB o mas.
- Opciones de despliegue: la via documentada es la libreria `jevmark` instalada desde GitHub sobre Python 3.11, apuntando `JEVMARK_CHECKPOINT` a la carpeta del adaptador; tambien se puede cargar un objeto `JevMark` con `config.yaml` y el checkpoint resuelto. Al ser adaptadores PEFT, se apoyan en el ecosistema transformers/PEFT. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia y throughput: latencia mediana batch-1 de 47,7 ms (`sft_06b`) y 74,8 ms (`sft_17b`) en una T4; no se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento relevante |
|---|---|---|---|---|---|---|
| jevmark sft_06b | Adaptador LoRA discriminativo sobre Qwen3-0.6B-Base | 0,6 mil millones (backbone) | no disponible | apache-2.0 | HuggingFace y GitHub | 0,956 acc / 0,013 ECE en dominio; 47,7 ms en T4 |
| jevmark sft_17b | Adaptador LoRA discriminativo sobre Qwen3-1.7B-Base | 1,7 mil millones (backbone) | no disponible | apache-2.0 | HuggingFace y GitHub | 0,952 acc / 0,015 ECE en dominio; 74,8 ms en T4 |
| Jev (TypeSafe AI) | Modelo de decision propietario (choice, score o si/no) | no disponible | no disponible | propietaria | API hosted | Referencia conceptual del proyecto; precios publicados de 0,042 USD por 1 M de tokens de entrada y salida gratuita |
| gpt-4.1-mini | LLM generativo propietario | no disponible | no disponible | propietaria | API | 0,908 en dominio y 0,918 en Banking77 en el subconjunto de 500 registros |

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte multilingue declarado.
- No genera texto: no sirve para tareas de generacion, resumen, dialogo ni tool calling; su salida es siempre una distribucion sobre opciones dadas.
- El rendimiento cae de forma notable en esquemas no vistos: 0,628 en emotion y 0,505 en la escala de 5 estrellas de Yelp (`sft_06b`), con ECE alto (0,164 en AG News, 0,207 en emotion), lo que indica mala calibracion fuera del dominio de entrenamiento.
- Los adaptadores se publican con `temperature` a 1.0 sin ajustar; para mejorar la calibracion en dominio hay que aplicar la temperatura ajustada (1,266 y 1,321) en `calibration.json`.
- La gestion de umbrales y el enrutado son responsabilidad del llamante; el modelo solo devuelve distribuciones y confianza.
- No hay pesos cuantizados ni formatos GGUF, por lo que el despliegue depende del stack Python/PEFT y de la libreria `jevmark`.
- El entrenamiento RLCD se basa en logs donde solo se revela la correccion de la propia respuesta, sin etiquetas; esto introduce dependencia de la distribucion de esos logs.
- El repositorio no tiene descargas ni likes en el momento de la consulta, y las cifras del adaptador `rlcd_banking77_06b` no se pudieron verificar por estar truncadas.
- Licencia apache-2.0, que permite uso comercial, pero conviene comprobar tambien las condiciones de los modelos base Qwen3 utilizados.

## Enlaces

- HuggingFace: https://huggingface.co/yuanphd/jevmark
- Repositorio de codigo y datos: https://github.com/yuan-phd/jevmark
- Especificacion de la API: https://github.com/yuan-phd/jevmark/blob/main/docs/API_SPEC.md
- Resultados v1: https://github.com/yuan-phd/jevmark/blob/main/docs/RESULTS_v1.md
- Resultados v2: https://github.com/yuan-phd/jevmark/blob/main/docs/RESULTS_v2.md
- Jev (AI model), Wikipedia: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Jev AI Model (TypeSafe): https://jevmodel.org/
- Presentacion de System One Models y Jev (blog de TypeSafe AI): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Documentacion de modelos de TypeSafe AI: https://docs.typesafe.ai/models
- Cobertura en TechCrunch: https://techcrunch.com/2026/09/18/a-new-kind-of-ai-model-from-a-chatgpt-inventor-is-thrilling-developers/
