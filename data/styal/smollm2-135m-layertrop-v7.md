# styal/SmolLM2-135M-layertrop-v7

# SmolLM2-135M-layertrop-v7

## Resumen

SmolLM2-135M-layertrop-v7 es un ajuste fino experimental del modelo HuggingFaceTB/SmolLM2-135M-Instruct, publicado por el usuario styal, cuyo objetivo no es mejorar las capacidades generales del modelo sino hacerlo mas robusto a la eliminacion de bloques del decodificador y, sobre todo, menos sensible a la cuantizacion de 4 bits. Se trata de un artefacto de investigacion sobre politicas de LayerDrop, no de un modelo de proposito general.

El modelo parte de la arquitectura SmolLM2 (familia Llama, transformer decoder-only) con 134.515.008 parametros reales, 30 bloques de decodificador y licencia Apache 2.0. Durante el entrenamiento se aplico LayerDrop por ejemplo: cada ejemplo de entrenamiento omite aleatoriamente 3 de los 30 bloques, de forma que la red debe seguir siendo utilizable sin cada uno de ellos. El resultado es una distribucion de pesos con redundancia deliberada.

La relevancia actual del checkpoint es acotada y muy especifica: demuestra que un ajuste fino con esta politica reduce un 43 por ciento el dano en el peor caso de eliminacion de bloques y un 31 por ciento el dano causado por una cuantizacion Q4_K, manteniendo intacto el error de redondeo relativo por tensor. Es util para quien investigue cuantizacion, poda estructural o tolerancia a fallos en pesos de modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), con LayerDrop por ejemplo durante el ajuste fino |
| Parametros totales | 134.515.008 (135M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base SmolLM2-135M-Instruct trabaja con 8.192 tokens, pero la model card de este checkpoint no lo confirma) |
| Tipos de cuantizacion | Pesos guardados en fp16; se ha evaluado cuantizacion Q4_K (super-bloques de 256 pesos, sub-bloques de 8x32, escala y minimo de 6 bits, carga de 4 bits = 4,5 bits por peso) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16); tamano del repositorio 0,3 GB |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino continuado de HuggingFaceTB/SmolLM2-135M-Instruct (revision 12fd25f), un transformer decoder-only de 30 bloques y 135M de parametros. La innovacion no esta en la arquitectura sino en el procedimiento de entrenamiento: se aplica LayerDrop por ejemplo con una politica de omision que combina un rampa de uniforme a importancia con un tope p_max = 0,35, de modo que cada ejemplo salta k = 3 de los 30 bloques. La importancia de cada bloque se calculo sobre una particion de desarrollo extraida del corpus de entrenamiento, nunca del de test. El entrenamiento consistio en 1.500 pasos, batch de 8, secuencia de 512, learning rate 2e-5 con scheduling coseno, una epoca y sin reutilizacion de filas.

Segun la propia model card, la politica de omision descrita ya no es la que contiene el codigo actual del repositorio: el proyecto ha migrado a una politica mas simple basada en Gumbel top-k sobre la contribucion de cada bloque al delta_loss total, sin anneal, sin tope y sin renormalizacion. Por tanto, los numeros publicados corresponden a la politica antigua y no serian reproducibles con el codigo actual sin revertir la configuracion. No se documenta el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional heredada del ajuste de instrucciones de SmolLM2-135M-Instruct.
- Ajuste fino sobre datos conversacionales (smol-smoltalk), lo que orienta el modelo a dialogos cortos multi-turno.
- Tolerancia a la eliminacion de cualquiera de sus 30 bloques del decodificador, con un dano maximo medido de 4,762 en delta de loss frente a 8,342 del modelo base.
- Mayor robustez a cuantizacion Q4_K: el dano de cuantizacion baja de +0,1526 a +0,1055.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling y agentes: no documentadas en la informacion disponible. Dado el tamano de 135M y el caracter experimental del checkpoint, no deben asumirse.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.

## Casos de uso

- Investigacion en cuantizacion de pesos: el checkpoint sirve como sujeto de prueba para medir cuanto dano introduce un cuantizador Q4_K dado un error de redondeo fijo, ya que se publican las metricas de fp16 frente a Q4_K.
- Investigacion en poda estructural y LayerDrop: permite estudiar como se redistribuye la importancia entre bloques cuando se elimina uno de ellos, con la metrica max_delta_loss como referencia.
- Validacion de cuantizadores propios: el autor incluye en el proyecto de origen un cuaderno (check_q4k.py) que verifica su implementacion Q4_K contra la version en C de llama.cpp, util para quien desarrolle herramientas de cuantizacion.
- Experimentos de tolerancia a fallos en inferencia distribuida: al estar entrenado para sobrevivir a la ausencia de un bloque, es un banco de pruebas para estrategias de inferencia degradada o parcial.
- Prototipado de asistentes conversacionales minimos en local: con 135M de parametros y licencia Apache 2.0 puede ejecutarse en dispositivos muy limitados para pruebas de concepto de dialogo corto.
- Educacion y docencia sobre ciclo de vida de modelos: al ser un artefacto con una model card detallada de metricas, resultados y limitaciones, es un ejemplo didactico de evaluacion rigurosa de un ajuste fino.
- Evaluacion comparativa de politicas de regularizacion: sirve para contrastar LayerDrop por ejemplo frente a otras tecnicas de regularizacion estructural en modelos del rango de 100 a 200 millones de parametros.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la propia model card, medidos sobre smol-smoltalk:test (512 conversaciones, 363.373 tokens puntuados, semilla 42). Incluyen la comparacion con el modelo base en la misma particion de evaluacion.

| Metrica | Base | Este modelo | Lectura |
|---|---:|---:|---|
| Eval loss | 1,2694 | 1,1914 | Mejor |
| max_delta_loss (dano en el peor caso de eliminacion de bloque) | 8,342 | 4,762 | -43 por ciento |
| sum_delta_loss | 21,676 | 9,688 | -55 por ciento |
| max_over_min | 100,6x | 62,9x | Mejor |
| Coeficiente de variacion | 2,159 | 2,575 | Peor |
| Cuota del bloque 0 en el coste de eliminacion | 38,5 por ciento | 49,2 por ciento | Mas concentrada |

| Metrica de cuantizacion Q4_K | Base | Este modelo |
|---|---:|---:|
| Loss en fp16 | 1,2696 | 1,1914 |
| Loss en Q4_K | 1,4222 | 1,2970 |
| Dano de Q4_K | +0,1526 | +0,1055 |

El autor aclara que el coeficiente de variacion y la relacion max/min no son senales de progreso para este objetivo, porque normalizan por la suma: una ejecucion que abarate la eliminacion de todos los bloques puede mostrar peor coeficiente de variacion. El error de redondeo relativo por tensor se mantiene practicamente igual antes y despues (aproximadamente 0,0738), de modo que la mejora proviene de una menor sensibilidad al error de redondeo, no de pesos mas faciles de redondear. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 0,27 GB solo de pesos, mas overhead de activaciones y cache KV; con 0,3 GB de repositorio es holgadamente ejecutable con menos de 1 GB de memoria.
- VRAM estimada en Q4_K (4,5 bits por peso): aproximadamente 0,076 GB de pesos, mas escalas y minimos; cabe en cualquier dispositivo.
- GPU recomendadas: no se especifica ninguna en la informacion disponible. Por tamano, cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en cualquiera; tambien en CPU, en Raspberry Pi y previsiblemente en moviles mediante llama.cpp.
- Opciones de despliegue: la model card declara library_name transformers y los tags text-generation-inference y endpoints_compatible, por lo que es desplegable con la libreria transformers y con TGI. Para llama.cpp u Ollama haria falta convertir los pesos a GGUF, ya que el repositorio solo contiene safetensors y no se publican ficheros GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---:|---|---|---|---|
| SmolLM2-135M-layertrop-v7 | 134.515.008 | No disponible | Apache 2.0 | Ajuste fino experimental con LayerDrop para resistir poda y cuantizacion | HuggingFace, safetensors |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M (aproximado) | No disponible en la informacion proporcionada | Apache 2.0 (heredada del base) | Modelo de instrucciones de proposito general | HuggingFace |
| SmolLM2-360M-Instruct | No disponible en la informacion proporcionada | No disponible | No disponible | Modelo de instrucciones de mayor tamano de la misma familia | HuggingFace |
| Qwen2.5-0.5B-Instruct | No disponible en la informacion proporcionada | No disponible | No disponible | Modelo multilingue de instrucciones de tamano similar | HuggingFace |

La comparacion cuantitativa directa disponible se limita al modelo base, con las metricas de las tablas anteriores (eval loss 1,2694 frente a 1,1914; dano de cuantizacion Q4_K +0,1526 frente a +0,1055). No se aportan datos comparativos frente a otras familias de modelos en la informacion disponible, por lo que no se puede establecer una comparativa de rendimiento fiable mas alla del binomio base-ajuste.

## Limitaciones y advertencias

- Es un artefacto de experimentacion declarado explicitamente como tal por el autor, no un modelo de proposito general; no deberia usarse como modelo de produccion sin una evaluacion propia.
- Las ganancias de cuantizacion se midieron sobre un unico corpus y una unica particion de evaluacion (smol-smoltalk:test, 512 conversaciones, semilla 42); la generalizacion a otros dominios no esta demostrada.
- La reduccion del 31 por ciento en el dano de cuantizacion no tiene control de ablacion: no existe una ejecucion con p_max = 0, por lo que no puede atribuirse especificamente a LayerDrop frente a cualquier otro ajuste fino continuado sobre los mismos datos.
- La importancia entre bloques esta mas concentrada, no menos: la cuota del bloque 0 en el coste de eliminacion sube del 38,5 al 49,2 por ciento, y el coeficiente de variacion empeora de 2,159 a 2,575.
- El codigo presente en el repositorio no reproduce este checkpoint: implementa una politica de omision posterior (Gumbel top-k sin anneal, sin tope y sin renormalizacion) distinta de la usada en el entrenamiento.
- Con 135M de parametros, la capacidad de razonamiento, codigo y conocimiento factual es muy limitada; no hay benchmarks estandar publicados que la respalden.
- No se declaran idiomas soportados, por lo que el comportamiento multilingue es desconocido.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano y no cuantificado en la informacion disponible. No se documentan sesgos conocidos.
- Licencia Apache 2.0, que permite uso comercial segun los terminos de dicha licencia; conviene verificar las condiciones del modelo base SmolLM2 del que deriva.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos eran ajenos al tema y se descartan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/styal/SmolLM2-135M-layertrop-v7
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio del modelo (incluye los directorios damage/ y checks_notebook/): https://huggingface.co/styal/SmolLM2-135M-layertrop-v7/tree/main
- Papers, blogs, demos o repositorios adicionales: no se han encontrado enlaces relevantes en la busqueda web.
