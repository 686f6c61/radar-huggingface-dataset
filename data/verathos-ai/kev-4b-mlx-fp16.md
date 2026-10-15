# verathos-ai/kev-4b-mlx-fp16

## Resumen

kev-4b-mlx-fp16 es un paquete de pesos publicado por verathos-ai para ejecutar en Apple silicon, mediante la libreria MLX, el modelo kev-4b de jaredpalmer. No es un entrenamiento nuevo, sino un reempaquetado en precision float16 del backbone con el adaptador ya fusionado, mas la cabeza pointer (pointer head), el tokenizer y un fichero `package.json` con los hashes SHA-256 y tamanos de cada archivo. El modelo cuenta con 4.205.751.296 parametros (unos 4,2 mil millones) y deriva, a su vez, del modelo base Qwen3.5-4B-Base.

El interes de esta ficha es doble. Por un lado, documenta un artefacto pensado para la "Verathos private lane app", es decir, un despliegue interno y no una release generalista: acumula cero descargas y cero likes en el momento de la consulta (creado el 15 de octubre de 2026). Por otro, resulta relevante tecnicamente porque describe una arquitectura poco habitual en este rango de tamano, con pesos de decaimiento DeltaNet y de normalizacion con puerta (gated-norm) conservados en float32 mientras el resto va en float16.

La licencia es Apache-2.0, heredada de kev-4b y de Qwen3.5-4B-Base, lo que en principio permite uso comercial. No obstante, al tratarse de un paquete sin model card detallada (sin idiomas declarados, sin benchmarks y sin longitud de contexto especificada), su evaluacion practica exige probarlo directamente antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B-Base; backbone con pesos DeltaNet (decaimiento) y gated-norm, mas cabeza pointer (pointer head). No se detalla si es MoE o denso |
| Parametros totales | 4.205.751.296 (aprox. 4,2 mil millones) |
| Parametros activos | no aplica (no se ha indicado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (float16) en MLX; pesos DeltaNet decay y gated-norm en float32; cabeza pointer en float32. No se publican otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (empaquetado MLX), mas tokenizer y `package.json` con SHA-256 |

Otros datos: modelo base jaredpalmer/kev-4b en la revision 6cfce5c2fa4b4bd64026336ab649c5ca78857d52; tamano del repositorio 8,4 GB; digest del paquete (SHA-256 de `package.json`) a590b5aec27e91b6732ac3227d0859e3c5817fd60b4dec3e6e3ad158e1752465; biblioteca declarada `mlx`; region `us`.

## Arquitectura y entrenamiento

El paquete no documenta el proceso de entrenamiento; unicamente describe el empaquetado. Segun la model card, el artefacto contiene el backbone con el adaptador fusionado en float16, manteniendo en float32 los pesos asociados al decaimiento DeltaNet y a la normalizacion con puerta, asi como la cabeza pointer. Esto sugiere un modelo orientado a tareas de seleccion o apuntado (pointer), previsiblemente vinculadas a uso agentico o de tool calling, aunque la model card no lo explicita.

El modelo base declarado es Qwen3.5-4B-Base, del que kev-4b es un finetune; esta ficha, a su vez, es una derivacion en MLX de kev-4b. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla el mecanismo de atencion mas alla de la mencion a DeltaNet (habitualmente asociado a atencion lineal con decaimiento) ni innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto: derivada de la familia Qwen3.5, aunque no se documentan capacidades concretas en la model card.
- Cabeza pointer (pointer head): presente en el paquete en float32; sugiere tareas de seleccion o apuntado sobre el contexto, si bien no se detalla su proposito.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Ejecucion local en Apple silicon: capacidad real y documentada, al ser un paquete MLX en float16 con pesos y tokenizer incluidos y verificables por SHA-256.

## Casos de uso

- Despliegue local en Apple silicon: el paquete esta disenado para ejecutarse en equipos Mac con chips de la serie M mediante MLX, con todos los pesos y el tokenizer incluidos y verificables por hash, lo que facilita su uso en entornos sin GPU dedicada.
- Verificacion de integridad de artefactos: gracias al `package.json` con SHA-256 y tamanos por archivo, puede usarse en pipelines que exijan trazabilidad y comprobacion criptografica de los pesos antes de cargarlos.
- Prototipado rapido en investigacion: al ser un modelo de 4,2 mil millones de parametros en fp16 (unos 8,4 GB), permite experimentar con un backbone de la familia Qwen3.5 en una sola maquina sin infraestructura de servidor.
- Evaluacion de arquitecturas con DeltaNet: util para quienes investigan mecanismos de atencion lineal con decaimiento y quieran inspeccionar pesos conservados en float32 frente al resto en float16.
- Entornos de privacidad estricta ("private lane"): al estar pensado para la aplicacion privada de Verathos, encaja en escenarios donde los datos no deben salir de la maquina local.
- Base para comparativas de cuantizacion: sirve como referencia fp16 frente a futuras versiones cuantizadas a 8 o 4 bits, si se publican, para medir la perdida de calidad.
- Integracion en flujos con tareas de seleccion o apuntado: si la cabeza pointer se confirma como mecanismo de seleccion sobre el contexto, podria emplearse en tareas de extraccion o grounding, aunque esto requiere verificacion practica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia en fp16: en torno a 8,4 GB solo para los pesos, mas el coste de la cache KV y el overhead del runtime; en la practica se recomienda disponer de 12-16 GB libres.
- Memoria unificada en Apple silicon: con 16 GB o mas de RAM unificada deberia ser suficiente para fp16; 24-32 GB ofrece mayor margen para contextos largos y lotes.
- GPU dedicadas: cabe holgadamente en una NVIDIA RTX 4090 (24 GB); tambien en A100, H100, L40S y similares, aunque el formato nativo es MLX, orientado a Apple silicon, no a CUDA.
- GPU de consumo: si, en tarjetas con 12-16 GB o mas de VRAM, siempre que exista una ruta de carga compatible (el paquete esta empaquetado para MLX).
- Opciones de despliegue: MLX es la ruta documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| verathos-ai/kev-4b-mlx-fp16 | 4,2 mil millones | no disponible | Apache-2.0 | safetensors / MLX fp16 | Paquete MLX para Apple silicon; derivado de kev-4b |
| jaredpalmer/kev-4b | no disponible | no disponible | Apache-2.0 | no disponible | Modelo base de este paquete; finetune de Qwen3.5-4B-Base |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible | Modelo base de la cadena; arquitectura de referencia |

No se dispone de datos de rendimiento ni de especificaciones completas de las alternativas para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta evaluaciones de sesgo.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un derivado de un modelo base de 4,2 mil millones de parametros, cabe esperar alucinaciones, pero no hay datos que lo cuantifiquen.
- Idiomas soportados: no declarados; se desconoce el grado de cobertura multilingue.
- Longitud de contexto: no especificada, lo que impide planificar cargas con contextos largos.
- Trazabilidad limitada: el autor no publica pipeline, idiomas ni benchmarks, y el repositorio registra cero descargas y cero likes, por lo que no existe validacion por parte de la comunidad.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones heredadas de kev-4b y de Qwen3.5-4B-Base.
- Dependencia de plataforma: el paquete esta empaquetado para MLX, lo que limita su uso directo fuera del ecosistema Apple silicon salvo conversion manual.
- Fecha de creacion: el repositorio figura creado el 15 de octubre de 2026, dato a tener en cuenta si se evalua su vigencia.
- Uso previsto: la model card indica que esta pensado para la "Verathos private lane app", no como una release generalista, lo que puede implicar soporte y documentacion reducidos.

## Enlaces

- HuggingFace (este paquete): https://huggingface.co/verathos-ai/kev-4b-mlx-fp16
- Modelo base kev-4b: https://huggingface.co/jaredpalmer/kev-4b
- Modelo base original Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Revision de kev-4b utilizada: 6cfce5c2fa4b4bd64026336ab649c5ca78857d52
- No se han encontrado papers, blogs, repos ni demos adicionales en la informacion proporcionada.
