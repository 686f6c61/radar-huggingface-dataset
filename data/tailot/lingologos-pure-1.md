# tailot/lingologos-pure-1

## Resumen

LingoLOGOS Pure 1 es un transformer encoder-decoder entrenado desde cero por el desarrollador independiente tailot (GitHub: tailot) para traducir frases de requisitos, expresadas en lenguaje natural en cinco idiomas (aleman, ingles, espanol, frances e italiano), a un algebra logica con estructura de parentesis. No se apoya en pesos preentrenados: los 48.253.952 parametros se han entrenado sobre un corpus paralelo sintetico de 12.140 pares generados a partir de cinco familias de patrones y 53 operadores.

La particularidad del modelo es que la generacion solo es valida a traves de un automata de pila (pushdown automaton) que restringe en cada paso el conjunto de tokens admisibles (`mask_spec.json`). Sin esa mascara el modelo no produce ninguna secuencia legal, segun la ablacion E5 de su propia evaluacion. Ademas, cada arbol generado se certifica a posteriori con el solver Z3, lo que convierte al sistema en un ejemplo practico de decodificacion restringida neuro-simbolica.

Es un modelo demostrativo, no generalista: 20 epocas, batch 64, learning rate pico 5e-4, entrenado en una unica NVIDIA GeForce RTX 5070 Ti. Su interes actual reside en la metodologia (constrained decoding + auditoria formal) y en su rendimiento medido sobre el split de test (675 filas), con una exactitud de arbol exacto de 0,9393 y plena legalidad sintactica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (formato lingologos-transformer-1) |
| Parametros totales | 48.253.952 (todos entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el campo `max_decoder_positions` existe en la config, pero no se publica su valor) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en precision original) |
| Idiomas soportados | de, en, es, fr, it |
| Licencia | other (sin licencia declarada en el repositorio de origen; consultar al autor antes de reutilizar) |
| Formato de pesos | safetensors (`model.safetensors`, 193.044.672 bytes) |
| Vocabulario | 3.921 tokens (tokenizer BPE, `tokenizer.json`) |
| Alfabeto del algebra | 53 operadores, 136 cabeceras de hoja, 75 valores de hoja |
| Parametros del entrenamiento | 20 epocas, batch 64, LR pico 5e-4, weight decay 0,01, gradient clipping 1,0, mixed precision auto |
| Mejor loss de validacion | 0,004036883175915053 (epoca 11) |
| Hardware de entrenamiento | NVIDIA GeForce RTX 5070 Ti |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder clasico entrenado desde cero, sin inicializacion a partir de pesos externos. El encoder procesa la frase de requisito en lenguaje natural y el decoder genera, token a token, un flujo de simbolos que representa un arbol de algebra logica entre marcadores `<RULE_START>` y `<RULE_END>`. La innovacion no esta en el bloque transformer sino en el decodificador: cada paso de generacion pasa por `mask_logits`, que asigna menos infinito a toda continuacion ilegal segun un automata de pila definido en `mask_spec.json`. El modelo, por tanto, no puede producir secuencias sintacticamente invalidas por construccion.

El entrenamiento se realizo sobre el corpus paralelo sintetico del repositorio LingoLOGOS: 12.140 pares, cinco familias de patrones, 53 operadores y cinco idiomas. No se documenta el numero total de tokens ni la composicion exacta del dataset, ni se menciona RLHF, DPO ni ajuste por preferencias. La evaluacion incluye una ablacion (E5) con los mismos pesos: con mascara la legalidad es 1,0000; sin mascara, 0,0000, y ninguna secuencia alcanza el marcador de fin. Es decir, la capacidad de generar algebra valida reside en el automata, no en los pesos. La certificacion posterior con Z3 comprueba que cada arbol es contingente (675 de 675), sin insatisfacibles ni tautologias.

## Capacidades

- Traduccion de frases de requisitos en lenguaje natural (de, en, es, fr, it) a un algebra logica con estructura de parentesis balanceada.
- Generacion restringida por automata de pila: solo emite secuencias que pertenecen al lenguaje del algebra definido en `mask_spec.json`.
- Certificacion formal externa mediante Z3: los arboles generados se pueden verificar como contingentes, insatisfacibles o validos.
- Cobertura de cinco familias logicas: condicional, frecuencia, recurrencia, umbral y (segun el desglose por dominio) patrones de agenda, domotica, finanze, produttivita y salute.
- Multilinguee en los cinco idiomas declarados, con rendimiento homogeneo (entre 0,9333 y 0,9481 de exactitud por idioma).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No soporta la direccion inversa (algebra a frase): esta especificada en el repositorio pero nunca se entreno.

## Casos de uso

- Extraccion de reglas de negocio a partir de requisitos en lenguaje natural: el modelo convierte una frase como una condicion de umbral en un arbol logico verificable, que despues se puede compilar a un motor de reglas o a un DSL interno. La certificacion Z3 permite descartar requisitos contradictorios antes de implementarlos.
- Validacion formal de especificaciones en pipelines de ingenieria de requisitos: integrado como paso previo a la codificacion, detecta ambiguedades y tautologias (0 arboles validos y 0 insatisfacibles en el test) y reduce el coste de revision manual.
- Generacion de configuraciones de domotica: el dominio `domotica` (0,8516 de exactitud) sugiere uso en la traduccion de instrucciones de usuario a reglas de automatizacion del hogar, siempre que se valide el arbol con Z3 antes de desplegarlo.
- Prototipado de asistentes de agenda y productividad: los dominios `agenda` y `produttivita` alcanzan 1,0000 de exactitud, por lo que el modelo es adecuado para convertir peticiones como "reuneme cada lunes a las 9" en reglas de recurrencia verificables.
- Investigacion en decodificacion restringida neuro-simbolica: el par (modelo, `mask_spec.json`) sirve como banco de pruebas reproducible para estudiar como un transformer pequeño se comporta bajo automatas de pila y auditoria formal, con ablacion incluida.
- Filtrado y normalizacion de requisitos en cinco idiomas europeos: al mantener exactitud similar en de, en, es, fr e it, se puede desplegar como preprocesador multilinguee en equipos distribuidos sin necesidad de un modelo por idioma.
- Docencia y demostraciones de verificacion formal: el flujo completo (tokenizer, mascara, modelo, Z3) cabe en un solo repositorio y se ejecuta en una GPU de consumo, lo que facilita su uso en cursos de IA simbolica o de ingenieria de software formal.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el split de test (675 filas, decodificacion greedy, semilla 23, veredicto PASS):

| Gate | Metrica | Resultado |
|---|---|---|
| E1 | Exactitud de arbol exacto | 0,9393 (634/675) |
| E1 | Esqueleto de parentesis correcto | 1,0000 |
| E1 | Secuencias truncadas | 0 |
| E2 | Legalidad del flujo generado (oraculo independiente) | 675/675 |
| E3 | Arboles auditados en Z3 | 675 |
| E3 | Arboles contingentes | 675 |
| E3 | Arboles insatisfacibles | 0 |
| E3 | Arboles validos (tautologias) | 0 |
| E3 | Errores de construccion | 0 |
| E3 | Numeros inventados (payloads ausentes de la entrada) | 5, tasa 0,0074 sobre 675 numeros |
| E5 | Legalidad con mascara | 1,0000 |
| E5 | Legalidad sin mascara | 0,0000 |
| E5 | Secuencias que alcanzan el marcador de fin sin mascara | 0 |

Desglose por familia logica:

| Familia | Exactitud | Exactos / filas |
|---|---|---|
| Condicional | 0,9568 | 177/185 |
| Frecuencia | 1,0000 | 35/35 |
| Recurrencia | 1,0000 | 255/255 |
| Umbral | 0,8350 | 167/200 |

Desglose por dominio:

| Dominio | Exactitud | Exactos / filas |
|---|---|---|
| Agenda | 1,0000 | 120/120 |
| Domotica | 0,8516 | 132/155 |
| Finanze | 0,9652 | 111/115 |
| Produttivita | 1,0000 | 135/135 |
| Salute | 0,9067 | 136/150 |

Desglose por idioma:

| Idioma | Exactitud | Exactos / filas |
|---|---|---|
| de | 0,9333 | 126/135 |
| en | 0,9481 | 128/135 |
| es | 0,9407 | 127/135 |
| fr | 0,9333 | 126/135 |
| it | 0,9407 | 127/135 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa 193 MB; en fp32 la huella es inferior a 1 GB, por lo que cabe holgadamente en cualquier GPU de consumo con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA; el propio autor entreno en una RTX 5070 Ti. Una RTX 3060, RTX 4060 o superior es suficiente para inferencia.
- Cabe en GPU de consumo: si, sin cuantizacion y con margen amplio.
- Opciones de despliegue: el modelo se consume a traves del paquete `src/neuro_symbolic` del repositorio fuente (PyTorch + safetensors). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la generacion sin la mascara del automata no es valida, lo que limita los servidores de inferencia genericos.
- Latencia y throughput: no disponibles. La decodificacion es secuencial paso a paso con `mask_logits`; existe `generate_batch` para lotes completos, pero no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada. LingoLOGOS Pure 1 no es un LLM generalista, sino un traductor requisito-a-algebra con decodificacion restringida; los LLM de proposito general (por ejemplo, modelos de 7B o 70B con tool calling) podrian abordar la tarea mediante prompting, pero no ofrecen garantias sintacticas ni certificacion formal, y no se han publicado comparaciones empiricas entre ambos enfoques en esta informacion.

| Criterio | LingoLOGOS Pure 1 | LLM generalista (referencia cualitativa) |
|---|---|---|
| Parametros | 48,25 M | orden de miles de millones (no comparable) |
| Contexto | no disponible | tipicamente 8K-128K |
| Garantia sintactica | 1,0000 por construccion (mascara) | ninguna |
| Certificacion formal | Z3 integrado en la evaluacion | no incluida |
| Licencia | other, sin licencia declarada | variable |
| Idiomas | 5 (de, en, es, fr, it) | decenas |

## Limitaciones y advertencias

- Modelo demostrativo, no generalista: 12.140 pares sinteticos, 20 epocas y cinco familias de patrones. No debe esperarse cobertura de requisitos fuera de ese dominio.
- Sin la mascara del automata de pila no genera ninguna secuencia legal (E5: 0,0000 de legalidad). La generacion libre no es una opcion.
- Puede inventar numeros: la mascara permite cualquier payload numerico y solo la auditoria Z3 junto con el registro lo detecta, con una tasa medida de 0,0074 (5 casos sobre 675 numeros).
- Los errores restantes son de etiquetado dentro de un arbol bien formado; el esqueleto de parentesis es siempre correcto, pero la familia de umbral (0,8350) y el dominio de domotica (0,8516) son los puntos debiles.
- No soporta la direccion inversa (algebra a frase): no genera verbalizaciones.
- Licencia `other` sin texto declarado en el repositorio de origen; el autor indica explicitamente que se le consulte antes de cualquier reutilizacion. Uso comercial no garantizado.
- No se documentan sesgos sociales, pero al entrenarse sobre un corpus sintetico de cinco familias y cinco idiomas, la cobertura linguistica esta acotada a esas plantillas.
- No hay soporte documentado para servidores de inferencia estandar (vLLM, TGI, llama.cpp), lo que complica el despliegue en produccion fuera del paquete Python del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tailot/lingologos-pure-1
- Repositorio fuente (GitHub, referenciado en la model card): github.com/tailot (ruta completa truncada en la informacion disponible)
- Repositorio LingoLOGOS (corpus sintetico y scripts de entrenamiento, referenciado en la model card): no disponible como URL completa
- Otro modelo del mismo autor: https://huggingface.co/tailot/universal-upscale
