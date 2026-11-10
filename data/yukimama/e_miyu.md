# yukimama/E_MiYu

## Resumen

E_MiYu es un adaptador LoRA publicado por el usuario yukimama sobre el modelo base google/gemma-4-12B-it. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (PEFT) de 1,6 GB alojado en Hugging Face, pensado para dotar al modelo base de un perfil conversacional orientado a un negocio concreto: la asistencia de una tienda llamada EPOCH-SHOP, con un asistente bautizado como "阿容" (A Rong).

El adaptador declara cuatro areas de especializacion: consultoria de producto (vehiculos, arquitectura, mapas, personajes, ropa, servicios de hosting y precios), asistencia de programacion en multiples lenguajes, consultoria de seguridad informatica y conversacion natural. El entrenamiento se realiza con 1.843 ejemplos de pregunta-respuesta en formato JSONL, mediante LoRA con r=16 y alpha=32 aplicado a las proyecciones de atencion q_proj, k_proj, v_proj y o_proj.

La relevancia de esta ficha es limitada pero ilustrativa: el autor indica explicitamente que el adaptador esta en entrenamiento continuo y que su comportamiento no esta estabilizado. La model card muestra solo tres lotes de 20 pasos con perdidas de 2,8127, 1,0893 y 0,6646, lo que sugiere un ajuste muy temprano sobre un dataset pequeno y de dominio cerrado. Los idiomas declarados son chino y ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (google/gemma-4-12B-it) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base declara 12B en su identificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango r=16 y alpha=32, inyectado unicamente en las proyecciones de atencion q_proj, k_proj, v_proj y o_proj del modelo base gemma-4-12B-it. No se modifican las capas MLP ni los embeddings, lo que reduce el numero de parametros entrenables y el tamano del artefacto (1,6 GB en el repositorio). El modelo base es un transformer decoder-only del que la informacion proporcionada no detalla numero de capas, dimension oculta ni regimen de atencion.

El dataset de entrenamiento, training_data.jsonl, contiene 1.843 ejemplos de pregunta-respuesta y conversacion, organizados en torno a cuatro categorias: consultoria de producto, asistencia de codigo, seguridad y chat general. El entrenamiento se ejecuta mediante un script (app.py) alojado en un Space de Hugging Face con ZeroGPU, disenado para entrenar en bloques de 20 pasos, guardar el adaptador y reanudar en la siguiente invocacion debido al limite de tiempo de ejecucion de la plataforma. La model card reporta tres lotes completados (60 pasos acumulados) con perdidas medias de 2,8127, 1,0893 y 0,6646. No se documenta uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni la composicion exacta del corpus mas alla de las cuatro categorias citadas.

## Capacidades

- Generacion de texto conversacional en chino e ingles, con un tono declarado como coloquial y cercano.
- Asistencia de programacion en Python, JavaScript/TypeScript, Java, C++, Go, SQL y bash, incluyendo explicacion, escritura, modificacion, depuracion, refactorizacion, optimizacion de rendimiento, anotacion de tipos y manejo de errores.
- Consultoria de producto y comparacion de planes y precios dentro del catalogo de EPOCH-SHOP (vehiculos, arquitectura y mapas, personajes y ropa, servicios de hosting).
- Consultoria de seguridad informatica: XSS, CSRF, inyeccion SQL, hashing de contrasenas, JWT, gestion de claves, HTTPS, proteccion contra fuerza bruta y seguridad en pagos con Stripe.
- Conversacion multi-turno de caracter general (charla, consuelo, humor).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso con agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Atencion al cliente de una tienda online: el adaptador esta entrenado con el catalogo y los precios de EPOCH-SHOP, por lo que puede responder consultas sobre planes de hosting, servicios de diseno o productos comparando alternativas dentro de ese catalogo concreto.
- Asistente de ventas con comparacion de planes: dado que el dataset incluye ejemplos de comparacion de servicios y precios, el modelo puede presentar diferencias entre opciones y justificar una recomendacion dentro del dominio entrenado.
- Soporte a desarrolladores en revision de codigo: puede explicar fragmentos en Python, TypeScript, Go o SQL y proponer refactorizaciones o anadir manejo de errores, util como primer nivel de triaje antes de una revision humana.
- Formacion interna en seguridad: el adaptador cubre temas como XSS, CSRF, JWT o hashing de contrasenas, por lo que sirve como asistente de consulta para equipos que necesiten recordar buenas practicas, siempre con verificacion posterior.
- Chatbot de acompanamiento en la web del negocio: el entrenamiento incluye ejemplos de conversacion coloquial, lo que permite mantener un tono cercano en interacciones de soporte no tecnicas.
- Prototipado rapido de asistentes de dominio cerrado: al ser un adaptador LoRA de 1,6 GB sobre un base de 12B, permite experimentar con un asistente especializado sin reentrenar el modelo completo, reutilizando la infraestructura del base.
- Base para iteracion continua: el flujo de entrenamiento por lotes de 20 pasos con guardado intermedio es replicable para seguir ampliando el dataset y ajustar el adaptador de forma incremental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida media de entrenamiento por lote:

| Lote | Pasos acumulados | Perdida media |
|---|---|---|
| 1 | 20 | 2,8127 |
| 2 | 40 | 1,0893 |
| 3 | 60 | 0,6646 |

## Requisitos de hardware

- El adaptador en si ocupa 1,6 GB en safetensors, pero la inferencia requiere cargar el modelo base gemma-4-12B-it completo; la VRAM necesaria la determina el base, no el adaptador.
- VRAM estimada para el base de 12B: aproximadamente 24 GB en FP16, en torno a 12-14 GB en cuantizacion de 8 bits y 8-10 GB en cuantizacion de 4 bits (estimaciones orientativas dependientes de la implementacion).
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S o dos RTX 4090 de 24 GB. Para cuantizacion 4 bits, una RTX 4090 o RTX 3090 de 24 GB es suficiente.
- Cabe en GPU de consumo (RTX 3090, 4090, 4080) unicamente con cuantizacion del modelo base.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT; para servirlo se puede fusionar con el base y usar vLLM o TGI, o bien cargarlo con llama.cpp/Ollama si se dispone de una conversion GGUF del base y del adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa. A modo de referencia estructural:

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| yukimama/E_MiYu | LoRA sobre gemma-4-12B-it | adaptador de 1,6 GB sobre base de 12B | no disponible | apache-2.0 | En entrenamiento, 1.843 ejemplos, dominio cerrado |
| google/gemma-4-12B-it | Modelo base completo | 12B | no disponible | licencia del base (no detallada aqui) | Modelo generalista sobre el que se aplica el adaptador |
| Adaptadores LoRA de dominio publico comparables | LoRA sobre bases de 7-13B | variable | variable | variable | No se identifican alternativas equivalentes en la informacion disponible |

## Limitaciones y advertencias

- El autor declara explicitamente que el adaptador sigue en entrenamiento y que su comportamiento no esta estabilizado; no debe usarse en produccion sin evaluacion previa.
- El dataset de entrenamiento es muy reducido (1.843 ejemplos) y de dominio cerrado, lo que limita la generalizacion fuera del catalogo y los temas de EPOCH-SHOP.
- Riesgo elevado de alucinacion en precios, especificaciones de producto y recomendaciones de seguridad, al no haberse validado con datos externos ni con tecnicas de alineacion documentadas.
- Sesgos no evaluados: no se reporta ninguna evaluacion de sesgo, toxicidad o robustez.
- Cobertura linguistica limitada a chino e ingles; el rendimiento en castellano no esta documentado ni respaldado por el entrenamiento.
- La licencia del adaptador es apache-2.0, pero el uso comercial esta condicionado por la licencia del modelo base gemma-4-12B-it, que debe verificarse por separado.
- Solo se ajustan las proyecciones de atencion; no se refuerzan las capas MLP, lo que puede limitar la profundidad del cambio de comportamiento.
- El proceso de entrenamiento por lotes de 20 pasos con guardado intermedio puede introducir inconsistencias entre versiones del adaptador; conviene fijar una revision concreta del repositorio.
- No hay informacion sobre tool calling ni integracion con agentes, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yukimama/E_MiYu
- Script de entrenamiento (Space): https://huggingface.co/spaces/yukimama/E_MiYu/blob/main/app.py
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
