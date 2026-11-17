# zephel01/MiMo-V2.6-Distill-Qwen-9B-MTP-GGUF

## Resumen

MiMo-V2.6-Distill-Qwen-9B-MTP-GGUF no es un modelo completo, sino un bloque de borrador (draft block) para decodificación especulativa. Lo publica el usuario zephel01 y contiene exclusivamente la capa NextN (MTP, Multi-Token Prediction) del modelo Qwen/Qwen3.5-9B, cuantizada a Q4_K_M en formato GGUF. Su función es acelerar la inferencia del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, un fine-tune de Qwen3.5-9B que carece de capa MTP en su checkpoint original.

El artefacto se usa con el motor de inferencia Abyss (repositorio de zephel01), que descarga este fichero junto al modelo principal y lo emplea como modelo borrador dentro de un esquema de decodificación especulativa. Como el modelo principal verifica cada token propuesto por el borrador, la salida final no cambia: el bloque solo afecta al rendimiento, no a la calidad ni al contenido generado.

Es relevante para desarrolladores que ya ejecutan MiMo-V2.6-Distill-Qwen-9B en Abyss y quieren reducir la latencia en GPUs de consumo. El autor reporta incrementos de throughput de aproximadamente el 26 % en contexto de 4K y del 22 % en 32K sobre una RTX 5090. El repositorio es muy pequeño (0,2 GB) y su licencia es Apache 2.0, heredada de Qwen3.5-9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capa NextN (MTP) de un transformer Qwen3.5-9B, extraida como bloque borrador para decodificacion especulativa |
| Parametros totales | 243.290.624 (dato del repo en safetensors); el fichero GGUF concreto pesa 161.924.512 bytes |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma independiente; el modelo principal se midio a 4K y 32K |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-9B, Copyright 2026 Alibaba Cloud) |
| Formato de pesos | GGUF (`mtp-Qwen3.5-9B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El fichero contiene unicamente la capa NextN (MTP) del modelo Qwen/Qwen3.5-9B: los tensores `blk.32.*`, 15 en total, junto con los metadatos del modelo. No se ha entrenado nada nuevo: el autor cuantizo los pesos originales de Qwen3.5-9B a Q4_K_M y elimino todos los tensores salvo los de esa capa. Se trata, por tanto, de un artefacto derivado, no de un modelo con entrenamiento propio.

La innovacion tecnica es el uso de esa capa como modelo borrador en decodificacion especulativa. El modelo principal (MiMo-V2.6-Distill-Qwen-9B) propone varios tokens por paso a traves del borrador y los verifica en paralelo, de modo que la distribucion de salida se mantiene identica a la de la decodificacion autoregresiva estandar. El autor reporta una tasa de aceptacion de borradores del 78,2 % a 4K y del 76,5 % a 32K.

## Capacidades

- No genera texto de forma autonoma: es un componente auxiliar de inferencia, no un modelo conversacional.
- Acelera la decodificacion del modelo principal MiMo-V2.6-Distill-Qwen-9B mediante decodificacion especulativa.
- Preserva exactamente la salida del modelo principal, ya que cada token propuesto se verifica.
- Integracion con el motor Abyss (version 1.3.168 o posterior) mediante `./setup-deepseek.sh --model mimo-9b`.
- Sin soporte propio de tool calling, agentes, vision ni audio; esas capacidades dependen del modelo principal.
- Sin capacidades multilingues propias; dependen del modelo principal.

## Casos de uso

- Aceleracion de inferencia local en Abyss: se coloca el fichero en el directorio `MTP/` junto al modelo principal y el motor lo detecta automaticamente, reduciendo la latencia por token sin tocar el codigo de la aplicacion.
- Servicio de chat de baja latencia en GPU de consumo: con una RTX 5090 y cuantizacion Q4_K_M del modelo principal, el autor mide 274,2 tok/s a 4K frente a 217,2 tok/s sin el bloque, lo que mejora la experiencia en conversaciones interactivas.
- Procesamiento de documentos largos: a 32K de contexto el rendimiento sube de 185,9 a 227,1 tok/s, util para resumenes y extraccion sobre entradas extensas donde el coste por token domina.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como referencia reproducible para medir tasas de aceptacion y ganancia de throughput en un mismo hardware.
- Despliegue de bajo coste en estaciones de trabajo con una sola GPU: al no requerir hardware adicional, permite mantener el modelo principal en Q4_K_M y ganar velocidad solo anadiendo este fichero de 162 MB.
- Integracion en pipelines de generacion por lotes: en tareas de sintesis o transformacion de texto por volumen, el mayor throughput reduce el tiempo total de ejecucion manteniendo la misma salida.

## Benchmarks y rendimiento

El autor publica mediciones de throughput en una RTX 5090 con Abyss, modelo principal MiMo-V2.6-Distill-Qwen-9B en Q4_K_M (cuantizacion de bartowski), decodificacion greedy y 256 tokens generados:

| Contexto | Sin bloque (tok/s) | Con bloque (tok/s) | Borradores aceptados |
|---|---|---|---|
| 4K | 217,2 | 274,2 | 78,2 % |
| 32K | 185,9 | 227,1 | 76,5 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo que es coherente con la naturaleza del artefacto: no altera la salida del modelo principal.

## Requisitos de hardware

- VRAM adicional para el bloque: aproximadamente 0,16 GB (tamano del fichero GGUF), negligible frente al modelo principal de 9B.
- GPU recomendada segun las mediciones del autor: RTX 5090. No se han publicado datos para A100, H100 ni otras GPU.
- Cabe en cualquier GPU de consumo capaz de ejecutar el modelo principal de 9B en Q4_K_M; el bloque en si no impone requisitos adicionales.
- Motor de despliegue: Abyss v1.3.168 o posterior. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 274,2 tok/s a 4K y 227,1 tok/s a 32K (RTX 5090, greedy, 256 tokens).
- Latencia: no disponible de forma desagregada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-MTP-GGUF (este) | Bloque borrador MTP | 243 M (fichero de 162 MB) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B | Modelo base completo | 9B (aproximado) | no disponible | Apache 2.0 | Hugging Face |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | Fine-tune completo | 9B (aproximado) | no disponible | MIT | Hugging Face |

No se dispone de datos de rendimiento ni de artefactos equivalentes de otros autores para establecer una comparacion cuantitativa. La comparativa se limita a la relacion entre este bloque y los modelos de los que deriva.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede usarse para generar texto sin el modelo principal y el motor Abyss.
- Solo funciona con MiMo-V2.6-Distill-Qwen-9B en Abyss v1.3.168 o posterior; no se documenta compatibilidad con otros motores.
- Al estar cuantizado a Q4_K_M, la tasa de aceptacion de borradores puede diferir de la de un borrador en mayor precision.
- Las mediciones proceden de un unico hardware (RTX 5090) y una unica configuracion; no hay datos de otras GPU ni de otros contextos.
- El repositorio tiene 0 descargas y 0 likes, y se creo y actualizo el mismo dia: no hay validacion independiente de las cifras reportadas.
- Riesgo de confusion: el nombre incluye "Qwen-9B" pero los parametros reales del fichero son 243 M; no debe confundirse con un modelo de 9B.
- Licencia Apache 2.0 heredada de Qwen3.5-9B; el modelo principal MiMo es MIT, por lo que conviene revisar ambas licencias en un uso comercial combinado.
- No hay informacion sobre sesgos, alucinacion o idiomas, ya que el bloque no genera contenido propio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/MiMo-V2.6-Distill-Qwen-9B-MTP-GGUF
- Modelo principal: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base del bloque MTP: https://huggingface.co/Qwen/Qwen3.5-9B
- Motor Abyss: https://github.com/zephel01/Abyss
