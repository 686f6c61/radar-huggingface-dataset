# ybc-lw/ouatlm

## Resumen

ouatlm es un modelo de lenguaje de tamano minimo (804.992 parametros) desarrollado por el usuario ybc-lw y publicado en Hugging Face bajo licencia MIT. Se trata de un transformer decoder-only con vocabulario de 59 tokens, hidden size de 128, 4 capas y 4 cabezas de atencion, con una longitud de contexto de solo 32 tokens. Su proposito es extremadamente acotado: completar la frase "once upon a time" cuando recibe un prefijo incompleto de esa misma frase y responder "I don't know" ante cualquier otra entrada.

El modelo no pretende ser un asistente general ni un generador de texto versatil. Es un experimento de alineacion de comportamiento muy delimitado, con un unico objetivo funcional y una prueba de validacion declarada por el autor sobre 50.000 textos generados segun reglas predefinidas, de los cuales solo 17 no cumplieron la expectativa. Esa cifra de error (0,034 %) es el unico dato de rendimiento aportado.

Su relevancia es fundamentalmente didactica y de investigacion: sirve como caso de estudio de como un modelo diminuto puede especializarse en una tarea de continuacion de texto concreta y de como se evalua el cumplimiento estricto de instrucciones en un dominio cerrado. No es adecuado para produccion general, atencion al cliente, generacion de codigo ni ninguna de las aplicaciones habituales de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 804.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre la frase en ingles "once upon a time" y la respuesta "I don't know") |
| Licencia | MIT |
| Formato de pesos | safetensors |

| Parametro adicional | Valor |
|---|---|
| Vocabulario | 59 tokens |
| Hidden size | 128 |
| Capas | 4 |
| Cabezas de atencion | 4 |
| Libreria | transformers |
| Pipeline | text-generation |
| Descargas | 572 |
| Likes | 0 |
| Tamano del repo | 0.0 GB |
| Fecha de creacion | 2026-08-26 |
| Ultima actualizacion | 2026-11-08 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional, sin mecanismos MoE, sin atencion lineal ni hibridaciones con SSM. Los hiperparametros declarados son: vocabulario de 59 tokens, hidden size de 128, 4 capas transformer, 4 cabezas de atencion y contexto maximo de 32 tokens. Con estas dimensiones el modelo totaliza 804.992 parametros, un orden de magnitud propio de un ejercicio de laboratorio mas que de un modelo de proposito general.

No se dispone de informacion sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. El autor unicamente documenta el comportamiento objetivo (completar "once upon a time" y responder "I don't know" en cualquier otro caso) y una validacion sobre 50.000 textos generados segun reglas predefinidas, con 17 fallos. No se detalla la metodologia de esa prueba ni la distribucion de las entradas evaluadas.

## Capacidades

- Generacion de texto limitada a la continuacion de la frase "once upon a time" a partir de un prefijo incompleto de la misma.
- Respuesta fija "I don't know" ante cualquier entrada fuera de ese dominio.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas; el unico material linguistico documentado esta en ingles.
- No dispone de modo thinking, vision, audio ni ninguna modalidad adicional.
- No dispone de capacidades de codigo ni matematicas mas alla de lo que permita un vocabulario de 59 tokens.

## Casos de uso

- Demostracion didactica de alineacion de comportamiento: el modelo ejemplifica como un transformer diminuto puede aprender una regla estricta de respuesta condicionada al prefijo, util en cursos y talleres sobre fundamentos de LLM.
- Prueba de infraestructura de inferencia: por su tamano (0,0 GB de repo) sirve para validar pipelines de transformers, text-generation-inference y endpoints compatibles sin coste de GPU.
- Test de tokenizadores y vocabularios cerrados: su vocabulario de 59 tokens permite experimentar con tokenizacion minima y estudiar el efecto del vocabulario en la generacion.
- Verificacion de conformidad de respuestas: util como caso de prueba de sistemas que evaluan el cumplimiento estricto de instrucciones en dominios cerrados, comparando la salida contra la regla esperada.
- Benchmark de robustez ante entradas fuera de distribucion: permite medir la tasa de respuestas correctas ("I don't know") ante entradas arbitrarias en experimentos de evaluacion.
- Material de referencia para comparativas de escalado: sirve como punto de control de 0,8 M de parametros en estudios sobre el efecto del tamano en la capacidad de seguir instrucciones.
- Educacion sobre limitaciones de contexto: con 32 tokens de ventana, es un ejemplo practico para explicar por que la longitud de contexto condiciona el diseno de aplicaciones.

## Benchmarks y rendimiento

El unico dato de rendimiento publicado por el autor es la prueba de alineacion sobre 50.000 textos generados segun reglas predefinidas, con 17 salidas que no cumplieron la expectativa, lo que equivale a una tasa de fallo del 0,034 % (99,966 % de cumplimiento). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Prueba | Resultado |
|---|---|
| Alineacion sobre 50.000 textos generados | 17 fallos (0,034 %) |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precision completa (804.992 parametros en fp32 equivalen a aproximadamente 3,2 MB de pesos, mas overhead de activaciones y contexto). Cabe holgadamente en cualquier GPU y en CPU.
- GPU recomendadas: cualquier GPU consumer o profesional; no requiere A100, H100 ni RTX 4090. Funciona en CPU sin problema.
- Cabe en consumer GPU: si, en todas, incluidas GPUs integradas y entornos sin GPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles segun los tags del repositorio. No se documenta soporte explicito de vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo y el contexto de 32 tokens, la latencia esperada es de milisegundos en cualquier hardware moderno, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Los modelos de referencia habituales en la categoria de transformers diminutos (por ejemplo, variantes minimas de GPT-2 o modelos de juguete con vocabulario cerrado) no aparecen citados ni evaluados por el autor, por lo que no es posible establecer una comparativa con datos verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ouatlm | 804.992 | 32 tokens | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito funcional practicamente nulo: solo completa "once upon a time" y responde "I don't know" en el resto de casos; no es un modelo de proposito general.
- Vocabulario de 59 tokens y contexto de 32 tokens: no puede procesar textos reales ni mantener conversaciones multi-turno.
- No hay informacion sobre sesgos; con un vocabulario y un corpus tan reducidos, cualquier sesgo estaria acotado al material de entrenamiento, que no se documenta.
- Riesgo de alucinacion: bajo en el sentido convencional, pero el modelo puede producir continuaciones incorrectas fuera de la regla esperada; el autor reporta 17 fallos en 50.000 pruebas.
- Limitaciones de idioma: no se declaran idiomas soportados; el unico material linguistico documentado esta en ingles.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantias; no obstante, el valor practico comercial del modelo es nulo.
- Caveat para produccion: no debe desplegarse como asistente ni como componente de un sistema conversacional; su uso razonable es educativo, experimental o como prueba de infraestructura.
- No se documentan tecnicas de seguridad, filtrado ni evaluaciones de robustez mas alla de la prueba de alineacion citada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ybc-lw/ouatlm
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
