# sydneyfong/qwen3-4b-english-correction

## Resumen

qwen3-4b-english-correction es un adaptador LoRA sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario sydneyfong. Su proposito es corregir frases en ingles mal escritas, en particular las producidas por hablantes nativos de cantonés que redactan en ingles (fenomenos de translationese, errores gramaticales y colocaciones propias del chinglish). El modelo acepta como entrada una frase en ingles y, de forma opcional, una referencia de significado en cantonés, y devuelve la frase corregida o la original sin cambios si ya es correcta.

El adaptador se entreno de principio a fin con tinygrad (sin PyTorch) sobre un Mac Studio con M2 Max, lo que constituye una de sus peculiaridades tecnicas mas destacadas. El modelo base Qwen3-4B-Instruct-2507 aporta la arquitectura transformer densa y la ventana de contexto, mientras que el LoRA anade la especializacion en correccion gramatical con un coste de almacenamiento minimo (0,2 GB de repositorio).

La relevancia actual del modelo radica en su enfoque de nicho: la correccion de ingles para hablantes de cantonés en Hong Kong, un caso de uso poco cubierto por los modelos generalistas. Su licencia Apache 2.0 y su formato de adaptador PEFT facilitan la integracion en pipelines existentes basados en transformers, aunque su alcance esta deliberadamente limitado a la correccion de frases sueltas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA |
| Parametros totales | 4B (modelo base); el adaptador LoRA anade un numero reducido de parametros entrenables (r=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en, yue (cantonés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA: adapter_model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32) aplicado sobre las proyecciones q/k/v/o y gate/up/down de todas las capas del transformer Qwen3-4B-Instruct-2507. El entrenamiento se realizo con tinygrad, incluyendo una implementacion personalizada de Qwen3 y del LoRA, validada token a token contra HF transformers antes de entrenar. Se uso SFT con mascara de solo completacion, plantilla de chat de Qwen, AdamW con learning rate 1.5e-4 y base en bf16 convertida a fp16.

Los datos de entrenamiento derivan del diccionario cantonés-ingles words.hk: frases de ejemplo en ingles editadas por voluntarios (a menudo con translationese) fueron corregidas por varios modelos profesor y parcialmente por humanos. El conjunto contiene 66.167 pares de entrenamiento y 1.374 de validacion, con campos en (entrada en ingles), zh (referencia en cantonés, puede ser nula), target (frase corregida), source, kind (correction o identity) y avg_score. Aproximadamente el 15% de los ejemplos omiten la linea en cantonés para que el modelo funcione tambien sin ella, y los pares de identidad ensenan al modelo a dejar intactas las frases ya correctas. El entrenamiento efectivo fue muy corto: unas 45 iteraciones de optimizador sobre un subconjunto de 960 ejemplos, con perdida de validacion que bajo de 2,0 a 0,88.

## Capacidades

- Correccion de gramatica, tiempo verbal, concordancia y articulos en frases inglesas.
- Correccion de colocaciones propias del chinglish y de translationese a partir de una referencia opcional en cantonés.
- Comportamiento de identidad: devuelve la frase sin cambios si ya es correcta.
- Entrada opcional de referencia en cantonés (yue) para mejorar la desambiguacion semantica.
- Generacion de texto de salida acotada a una sola frase corregida, sin explicaciones.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues limitadas a ingles y cantonés.
- Capacidades especiales: modo de correccion con referencia bilingue; no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Correccion de textos de estudiantes de ingles en Hong Kong: el modelo recibe frases redactadas por hablantes de cantonés y devuelve la version corregida, aprovechando la referencia en cantonés para resolver ambiguedades de traduccion literal.
- Edicion de entradas de diccionarios bilingues: integrado en el pipeline de words.hk o similares, corrige las frases de ejemplo en ingles antes de publicarlas, manteniendo la coherencia con el significado cantonés.
- Herramienta de escritura asistida para profesionales de Hong Kong: plugin o API que corrige correos y mensajes en ingles sin necesidad de explicaciones, gracias a la salida de una sola frase.
- Preprocesado de datasets multilingues: limpieza de frases en ingles generadas por traductores automaticos o por hablantes no nativos antes de usarlas en entrenamiento de otros modelos.
- Filtrado de calidad en plataformas de contenido: deteccion y correccion automatica de frases mal formadas en ingles en foros o comentarios de usuarios de habla cantonesa.
- Evaluacion de sistemas de traduccion: el modelo sirve como corrector de referencia para medir y mejorar la calidad del ingles producido por sistemas de MT en el par cantonés-ingles.
- Asistencia ligera en dispositivos: al ser un adaptador pequeno sobre un modelo de 4B, puede desplegarse en entornos con recursos moderados para correccion en tiempo real de frases sueltas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion reportada por el autor es cualitativa: 14 casos sinteticos escritos a mano (gramatica, tiempo verbal, concordancia, articulos, colocaciones chinglish, translationese, frases largas y entradas ya correctas, con y sin referencia en cantonés) superados en su totalidad, incluyendo el comportamiento de identidad. Tambien se verifico que el adaptador produce salidas identicas a traves de HF transformers+peft y de la ruta de inferencia original en tinygrad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo base de 4B, la inferencia en bf16 requiere aproximadamente 8-10 GB de VRAM, y en cuantizacion de 4 bits puede reducirse a unos 3-4 GB (estimacion orientativa, no proporcionada por el autor).
- GPU recomendadas: no especificadas en la informacion disponible; el autor entreno en un Mac Studio con M2 Max.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 8 GB o mas de VRAM para el modelo base en cuantizacion, aunque no se documenta oficialmente.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor); el modelo base puede servirse con vLLM, llama.cpp, Ollama o TGI, aunque la integracion del adaptador LoRA no esta documentada para todas ellas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-english-correction | 4B (base) + LoRA | no disponible | Correccion de ingles para hablantes de cantonés | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible | Modelo generalista de instrucciones | Apache 2.0 | Hugging Face |
| Grammarly (comercial) | no disponible | no disponible | Correccion gramatical general en ingles | Propietaria | Servicio comercial |
| Modelos de correccion gramatical GECToR/T5 | variable | variable | Correccion gramatical automatica | variable | Hugging Face / repositorios academicos |

La comparativa con alternativas especificas de correccion gramatical para hablantes de cantonés no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado sobre un subconjunto pequeno (unos 200 ejemplos unicos vistos, con repeticion intensa); la cobertura de estilos mas alla del dominio del diccionario no esta probada.
- La referencia en cantonés es opcional, pero mejora el tratamiento del translationese; sin ella, el rendimiento puede degradarse en casos ambiguos.
- Disenado para correccion de una sola frase; los documentos largos quedan fuera de su alcance.
- Riesgo de alucinacion y de sobrerreaccion en frases ya correctas no evaluado a gran escala; la evaluacion se limita a 14 casos sinteticos.
- Sesgos conocidos: no documentados, pero el dataset proviene de un diccionario editado por voluntarios, lo que puede introducir sesgos de estilo y de registro.
- Limitaciones de idioma: solo ingles y cantonés; no se garantiza su comportamiento en otras variedades de chino ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 debe verificarse por separado (su licencia tambien es Apache 2.0 segun la informacion disponible).
- Caveat para produccion: el adaptador requiere cargar el modelo base completo; el repositorio solo contiene los pesos LoRA (0,2 GB), no un modelo autonomo.

## Enlaces

- Hugging Face: https://huggingface.co/sydneyfong/qwen3-4b-english-correction
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Diccionario words.hk (origen de los datos): no disponible en la informacion proporcionada
- tinygrad (framework de entrenamiento): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
