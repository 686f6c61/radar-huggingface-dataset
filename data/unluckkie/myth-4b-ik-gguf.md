# Unluckkie/Myth-4B-IK-GGUF

## Resumen

Myth-4B-IK-GGUF es una coleccion de cuantizaciones GGUF del modelo Myth-4B, un merge SLERP al 50/50 entre Qwen 3.5 4B y Qwen3.5-4B-Neo. El objetivo declarado del merge es combinar el conocimiento factual amplio del modelo Qwen base con la capacidad de razonamiento profundo de la variante Neo. El autor de las cuantizaciones es Unluckkie, mientras que el modelo base lo publica dracko14.

La aportacion principal de este repositorio no es el modelo en si, sino el esquema de cuantizacion "MoQ-Balanced" disenado por el autor. Frente al mapa MoQ estandar de la comunidad, que comprime las capas Feed-Forward Network a 2 bits (IQ2_KS) y degrada severamente el razonamiento logico, esta variante fija un minimo de 3 bits (IQ3_KS) para las FFN, mantiene las capas de atencion en 4 bits (IQ4_KS) y preserva la tensor de salida en alta precision. El resultado es un fichero de aproximadamente 2,0 GB que, segun el autor, conserva la capacidad de razonamiento de la arquitectura de 4B y cabe en equipos con 8 GB de RAM.

Es relevante ahora porque demuestra una via practica para ejecutar modelos de 4B con razonamiento funcional en hardware de gama baja sin GPU dedicada, a costa de depender de un fork especifico de llama.cpp (ik_llama.cpp) y de perder compatibilidad con el ecosistema estandar de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Qwen 3.5 4B; detalles no disponibles) |
| Parametros totales | 4.326.350.848 (4,33 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 4096`) |
| Tipos de cuantizacion | MoQ-Balanced (FFN IQ3_KS, atencion IQ4_KS, salida en alta precision) e IQ5_KS uniforme |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Myth-4B es un merge de pesos mediante SLERP al 50/50 entre Qwen 3.5 4B y Qwen3.5-4B-Neo. No se dispone de informacion sobre la arquitectura interna detallada (numero de capas, dimensiones ocultas, atencion) mas alla de que se trata de un transformer decoder-only de 4,33 mil millones de parametros. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovacion tecnica del repositorio reside en el proceso de cuantizacion. Se parte de `Myth-4B.Q8_0.gguf` y se aplica `llama-quantize --imatrix --custom-q` del fork ik_llama.cpp, usando una matriz de calibracion (`imatrix.dat`) generada a partir de texto de razonamiento general. El mapa por tensor es el siguiente: capas FFN a IQ3_KS (3 bits), capas de atencion a IQ4_KS (4 bits) y tensor de salida en alta precision. El autor justifica el suelo de 3 bits en las FFN argumentando que la compresion a 2 bits del MoQ estandar "lobotomiza" el razonamiento logico del modelo, haciendole fallar preguntas trampa basicas. El proceso se ejecuto en un portatil con i5-8250U, 8 GB de RAM y sin GPU dedicada.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento logico y resolucion de puzzles, segun el autor, preservado gracias al suelo de 3 bits en las FFN.
- Modo de razonamiento interno con bloque de pensamiento, que puede omitirse mediante el flag `/no_think` al final del prompt.
- Conocimiento factual heredado del modelo Qwen base, segun la descripcion del merge.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Razonamiento y resolucion de problemas en equipos de 8 GB de RAM: el quant MoQ-Balanced (~2,0 GB) permite ejecutar un modelo de 4B con lógica funcional en portatiles sin GPU dedicada, usando ik_llama.cpp con contexto de 4096 tokens.
- Asistente conversacional local en ingles: el modelo puede mantener dialogos multi-turno en entornos sin conectividad, con el flag `/no_think` para respuestas directas cuando no se requiere cadena de razonamiento.
- Prototipado y evaluacion de tecnicas de cuantizacion: el repositorio sirve como referencia para comparar el esquema MoQ-Balanced frente a IQ5_KS uniforme en tareas de razonamiento, midiendo la degradacion introducida por la compresion de las FFN.
- Educacion y experimentacion con modelos mergeados: util para estudiar el efecto de los merges SLERP entre variantes de una misma familia (Qwen 3.5 4B y Neo) en tareas de conocimiento factual frente a razonamiento.
- Generacion de texto offline en dispositivos de bajos recursos: con 2,0 GB de fichero y ejecucion en CPU, encaja en escenarios de borde donde no hay acelerador hardware disponible.
- Base para ajuste fino o destilacion en ingles: al estar bajo Apache 2.0, puede servir de punto de partida para experimentos posteriores, aunque requiere convertir desde GGUF a un formato entrenable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente afirma cualitativamente que el quant MoQ-Balanced "pasa puzzles logicos" y "corre mas rapido que un IQ4_KS uniforme", sin aportar cifras de MMLU, HumanEval, GSM8K ni mediciones de tokens por segundo.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,0 GB para el quant MoQ-Balanced y 2,8 GB para el IQ5_KS, segun los tamanos de fichero declarados. El autor indica que el MoQ-Balanced cabe en portatiles de 8 GB de RAM.
- GPU recomendadas: no disponibles; el autor valido el modelo en CPU (i5-8250U) sin GPU dedicada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 2-2,8 GB, aunque no se documentan pruebas en tarjetas concretas como RTX 4090 o similares.
- Opciones de despliegue: exclusivamente ik_llama.cpp. Los quants IQK no cargan en llama.cpp estandar, Ollama ni LM Studio, segun advierte el autor.
- Latencia y throughput: no disponibles; solo se afirma que el MoQ-Balanced es mas rapido que un IQ4_KS uniforme, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion destacada | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| Myth-4B-IK-GGUF (MoQ-Balanced) | 4,33 B | no disponible | IQ3_KS FFN + IQ4_KS atencion (~2,0 GB) | Apache 2.0 | Solo ik_llama.cpp |
| Myth-4B-IK-GGUF (IQ5_KS) | 4,33 B | no disponible | IQ5_KS uniforme (~2,8 GB) | Apache 2.0 | Solo ik_llama.cpp |
| Myth-4B (modelo base) | 4,33 B | no disponible | safetensors / Q8_0 | Apache 2.0 | Ecosistema estandar |
| Qwen 3.5 4B (componente del merge) | ~4 B | no disponible | multiples | no disponible en esta ficha | Ecosistema estandar |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia critica de ik_llama.cpp: los quants IQK no cargan en llama.cpp estandar, Ollama ni LM Studio, lo que limita su integracion en pipelines existentes.
- Solo ingles declarado; no hay soporte multilingue documentado.
- El modelo base es un merge SLERP sin documentacion publica sobre datos de entrenamiento, lo que impide evaluar sesgos y calidad de forma rigurosa.
- Riesgo de alucinacion inherente a modelos de 4B, agravado por la cuantizacion agresiva de las FFN en el quant MoQ-Balanced.
- El modo de razonamiento interno consume tokens adicionales; el flag `/no_think` es un workaround no estandar.
- Sin benchmarks publicados: las afirmaciones del autor sobre preservacion del razonamiento son cualitativas y no verificadas de forma independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia del modelo base y de sus componentes debe verificarse por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Unluckkie/Myth-4B-IK-GGUF
- Modelo base: https://huggingface.co/dracko14/Myth-4B
- Herramienta de cuantizacion ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
