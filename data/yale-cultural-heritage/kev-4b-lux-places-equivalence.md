# yale-cultural-heritage/kev-4b-lux-places-equivalence

## Resumen

kev-4b-lux-places-equivalence es un adaptador PEFT (LoRA) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por Yale Cultural Heritage AI, que resuelve una tarea muy concreta de resolucion de entidades en el dominio del patrimonio cultural: determinar si los registros de autoridad externos declarados como `equivalent` en un registro de lugar de LUX (Wikidata, GeoNames, Who's On First, Getty TGN, Library of Congress, GND) se refieren efectivamente al mismo lugar del mundo real. Cuando no es asi, el modelo identifica que pares de autoridades difieren, lo que permite dividir una fusion incorrecta (over-merge).

El modelo se entrena sobre el checkpoint kev-4b-europeana-persons, que a su vez deriva de jaredpalmer/kev-4b, y responde preguntas de tipo "Noul" (afirmaciones sobre un estado) devolviendo una probabilidad calibrada mediante un head especifico y una temperatura reajustada (T = 1.674). No es un modelo generativo de proposito general: es un clasificador de decisiones binarias dentro del ecosistema chai-engine, pensado para integrarse en pipelines de limpieza de datos de colecciones culturales.

Su relevancia actual radica en que aborda un problema real de calidad de datos en agregadores como Europeana o LUX, donde las fusiones erroneas de registros de lugares degradan la recuperacion y la vinculacion de colecciones. El adaptador ocupa unos 135 MB adicionales sobre el modelo base de 4B parametros, lo que lo hace desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B-Base) con adaptador LoRA r16 / alpha32 sobre proyecciones de atencion, MLP y DeltaNet; head de clasificacion binaria con temperatura ajustada |
| Parametros totales | 4B (modelo base); adaptador LoRA de aproximadamente 135 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) + head.pt |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre Qwen/Qwen3.5-4B-Base (commit 1001bb4d), con modificaciones en las proyecciones de atencion, MLP y DeltaNet. Se inicializa desde el adaptador yale-cultural-heritage/kev-4b-europeana-persons y se entrena con system1-finetune-bench. Incluye un head de puntero ("pointer head") afinado y una temperatura de reescalado (T = 1.674) ajustada sobre preguntas Noul, que convierte la salida del modelo en una probabilidad calibrada.

Los datos de entrenamiento provienen de una muestra sembrada de 1.000 de los 143.559 lugares de LUX que tienen dos o mas equivalentes externos reconocidos. Cada registro de autoridad se renderiza en una linea (id de fuente, nombre, descripcion, pais, coordenadas). Dos modelos (Gemini 3.1 Flash Lite y TypeSafe's Jev) respondieron la afirmacion global y, cuando la rechazaron, una afirmacion por cada par de autoridades, bajo una regla explicita de equivalencia (un pueblo y el municipio del mismo nombre son el mismo lugar; un estado y una ciudad con su nombre no lo son; una pagina de desambiguacion no es un lugar). Solo se conservaron las 2.063 decisiones en las que ambos modelos coincidieron (577 "no son el mismo lugar"); las 479 discrepancias se reservaron para revision humana. El split se hizo por lugar: 1.312 entrenamiento / 252 desarrollo / 499 test.

Las etiquetas son acuerdo automatico entre dos modelos, no verificadas por personas, por lo que las metricas miden concordancia con ese consenso y no exactitud real.

## Capacidades

- Clasificacion binaria de afirmaciones de equivalencia entre registros de autoridad de lugares, con salida de probabilidad calibrada.
- Respuesta a dos tipos de pregunta: afirmacion global sobre el conjunto de equivalentes de un registro y afirmaciones por pares de autoridades.
- Deteccion de over-merges: identifica que pares concretos de autoridades no coinciden, permitiendo dividir la fusion.
- Integracion en el ecosistema chai-engine como `decision.DecisionClassifier` de la familia `pointer`.
- Ejecucion en CPU, CUDA o MPS (Apple Silicon).
- Capacidad de razonamiento sobre reglas explicitas de equivalencia incluidas en el estado de entrada.
- No soporta tool calling, agentes multi-paso ni generacion de texto libre; es un clasificador de decision, no un modelo conversacional.

## Casos de uso

- Limpieza de agregadores de patrimonio cultural: procesar los registros de lugares de LUX con multiples equivalentes externos para detectar y marcar fusiones incorrectas antes de publicar el grafo de datos.
- Validacion de vinculacion de autoridades: comprobar que los enlaces a Wikidata, GeoNames, Getty TGN, LoC y GND de un mismo registro apuntan realmente al mismo lugar, evitando propagar errores a colecciones vinculadas.
- Curaduria asistida: generar listas de pares "x no es igual a y" que los documentalistas revisan para corregir registros, reduciendo el trabajo manual a los casos ambiguos.
- Enriquecimiento de pipelines de Europeana: integrar el modelo en flujos de normalizacion de lugares para mejorar la precision de la busqueda geografica y la recuperacion de objetos culturales.
- Auditoria de calidad de datos a gran escala: ejecutar el modelo sobre los 143.559 lugares de LUX con dos o mas equivalentes para cuantificar la tasa de over-merge del catalogo.
- Desambiguacion de toponimos historicos: distinguir entre entidades con nombres identicos (una comuna y la que la absorbio, un estado y una ciudad homonima) usando las descripciones y coordenadas de las autoridades.
- Investigacion en resolucion de entidades: servir como referencia reproducible de un enfoque "system-one" (decision rapida y probabilistica) aplicado a datos de patrimonio.

## Benchmarks y rendimiento

Decisiones Noul sobre el split de test reservado (499 decisiones sobre 150 lugares; 322 "mismo lugar"):

| Modelo | Balanced accuracy | AUROC | Brier |
|---|---|---|---|
| kev-4b-europeana-persons (sin ajustar) | 0.795 | 0.944 | 0.115 |
| **kev-4b-lux-places-equivalence** | **0.940** | **0.989** | **0.044** |
| — afirmaciones globales (144) | 0.852 | 0.972 | 0.051 |
| — afirmaciones por pares (355) | 0.947 | 0.992 | 0.040 |

Sobre un split de test anterior y mas ruidoso (636 decisiones etiquetadas solo por Gemini, sin la regla) obtiene 0.853 de balanced accuracy y 0.946 de AUROC, frente a 0.725 / 0.833 del modelo sin ajustar. El checkpoint se eligio por perdida en el split de desarrollo, no por la puntuacion de test. Las 29 decisiones de test que aun falla son mayoritariamente fusiones genuinamente discutibles (una comuna y la que la absorbio; un estado y un municipio con su nombre).

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa aproximadamente 135 MB; el modelo base Qwen3.5-4B requiere VRAM adicional segun cuantizacion (no se especifican cifras en la informacion disponible).
- GPU recomendadas: no se indican modelos concretos; el ejemplo de la model card usa `device: "mps"` en un Apple M4 Max y menciona `cuda` como alternativa.
- Cabe en GPU de consumo: si, siempre que el modelo base de 4B quepa en la VRAM disponible; no se detallan configuraciones concretas.
- Opciones de despliegue: chai-engine (carga en proceso desde el Hub o carpeta local); no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia: aproximadamente medio segundo por decision en un M4 Max una vez cargado el modelo (dato de la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (balanced accuracy / AUROC en test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kev-4b-lux-places-equivalence | 4B + LoRA | no disponible | 0.940 / 0.989 | Apache 2.0 | HuggingFace |
| kev-4b-europeana-persons | 4B + LoRA | no disponible | 0.795 / 0.944 | no disponible | HuggingFace |
| kev-4b (jaredpalmer) | 4B + LoRA | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks de modelos alternativos de proposito general para esta tarea especifica de resolucion de entidades de lugares.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son acuerdo automatico entre Gemini 3.1 Flash Lite y TypeSafe's Jev, no verificadas por personas; las metricas miden concordancia con ese consenso, no exactitud frente a verdad humana.
- Las 479 decisiones en las que ambos modelos discreparon se reservaron para revision humana y no forman parte del entrenamiento.
- El modelo falla en fusiones genuinamente ambiguas (comunas absorbidas, estados y municipios homonimos), que constituyen la mayoria de sus 29 errores en test.
- Es un clasificador de decision binaria, no un modelo generativo: no admite instrucciones libres ni conversacion.
- No hay informacion sobre sesgos geograficos o linguisticos; los datos provienen de registros de patrimonio cultural occidental (LUX, Europeana), lo que puede limitar su generalizacion a otras regiones.
- No se documentan los idiomas soportados ni la longitud de contexto del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-4B-Base y de los checkpoints intermedios.
- El modelo debe consultarse con el formato exacto de estado y pregunta con el que fue entrenado (etiqueta del registro LUX, lineas de autoridad y regla); usarlo de otra forma puede degradar las probabilidades.

## Enlaces

- HuggingFace: https://huggingface.co/yale-cultural-heritage/kev-4b-lux-places-equivalence
- Modelo base del adaptador: https://huggingface.co/yale-cultural-heritage/kev-4b-europeana-persons
- Checkpoint kev-4b original: https://huggingface.co/jaredpalmer/kev-4b
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de entrenamiento: https://github.com/yale-ch/system1-finetune-bench
- Workflow de lugares LUX: https://github.com/yale-ch/lux-bad-places-system-one
- Motor de ejecucion: https://github.com/yale-ch/chai-engine
