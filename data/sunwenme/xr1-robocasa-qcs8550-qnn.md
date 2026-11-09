# sunwenme/xr1-robocasa-qcs8550-qnn

## Resumen

El modelo `sunwenme/xr1-robocasa-qcs8550-qnn` es una compilación de contextos QNN (Qualcomm Neural Network) del modelo Xiaomi XR-1 RoboCasa, un modelo de visión-lenguaje-acción (VLA) orientado a robótica. Lo publica el usuario sunwenme y su propósito es permitir la ejecución del modelo original de Xiaomi sobre el acelerador HTP v73 del SoC Qualcomm QCS8550, un chip típicamente presente en dispositivos embebidos y de borde.

El repositorio no contiene los pesos originales en BF16 ni el dataset RoboCasa, sino los binarios de contexto QNN compilados junto con un servidor nativo AArch64, un manifiesto de placa, sumas de verificación y la documentación de licencia y atribución. El modelo subyacente combina un codificador de visión, un backbone de lenguaje Qwen3-VL y un transformador de difusión (DiT) que genera trozos de acción para control robótico.

La relevancia de esta ficha radica en que demuestra una migración funcional de un modelo VLA de investigación a hardware de borde Qualcomm, con una precisión prácticamente idéntica a la reproducción en BF16 sobre RTX 4090 (74,71 % frente a 74,25 % en RoboCasa v0.2). Está pensado para desarrolladores que quieran desplegar políticas robóticas en placas con QCS8550 sin depender de una GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA híbrida: codificador de visión con Patch-Gemm, backbone Qwen3-VL (36 capas) y DiT con 5 pasos de flujo Euler |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 288 tokens de secuencia en Qwen |
| Tipos de cuantizacion | W8A16 (INT8 pesos, INT16 activaciones) en visión y Qwen3-VL; DiT en FLOAT ONNX compilado sin cuantización explícita de pesos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contextos QNN compilados (8 binarios de contexto), más servidor nativo AArch64; no incluye checkpoint BF16 |
| Entrada de cámara | 3 × 256 × 256 |
| `pixel_values` de visión | `[768, 1536]` |
| Estado del robot | 60 dimensiones |
| Trozo de acción | 10 × 60 |
| Pasos de flujo DiT | 5 |
| Acelerador objetivo | Qualcomm QCS8550, HTP v73 |
| Runtime requerido | QAIRT/QNN 2.50 |

## Arquitectura y entrenamiento

La arquitectura del modelo original Xiaomi XR-1 RoboCasa es una política VLA compuesta por tres bloques: un codificador visual basado en Patch-Gemm que procesa imágenes de cámara de 3 × 256 × 256, un backbone de lenguaje Qwen3-VL de 36 capas que consume una secuencia de 288 tokens junto con el estado del robot de 60 dimensiones, y un transformador de difusión (DiT) que genera un trozo de acción de 10 × 60 mediante 5 pasos de flujo Euler. La compilación QNN divide las 36 capas de Qwen3-VL en seis contextos secuenciales de seis capas cada uno, lo que permite ejecutar el modelo por etapas en el acelerador HTP.

En cuanto a la cuantización, el paquete aplica W8A16 (pesos INT8, activaciones INT16) tanto al codificador de visión como a Qwen3-VL. El DiT se compila como ONNX en FLOAT sin cuantización explícita de pesos, y las cinco actualizaciones Euler se ejecutan en el runtime del host. La compilación conserva el Q/DQ de pesos de Qwen, omite el Q/DQ de activaciones no asociadas a pesos y mantiene los límites `Where` de la máscara de atención fuera de la aritmética cuantizada. Las tres primeras capas globales de Qwen usan una aproximación de SiLU con `u = exp(-abs(x))`, `r = u / (1 + u)` y `silu = x * where(x >= 0, 1-r, r)`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original. El repositorio no incluye el checkpoint BF16 ni el dataset RoboCasa, solo los artefactos compilados.

## Capacidades

- Control robótico de visión-lenguaje-acción: genera trozos de acción de 10 × 60 a partir de imágenes de cámara y estado del robot de 60 dimensiones.
- Percepción visual: procesa imágenes de 3 × 256 × 256 mediante un codificador Patch-Gemm.
- Razonamiento multimodal: el backbone Qwen3-VL integra información visual y de estado para producir representaciones de acción.
- Generación de acciones por difusión: el DiT ejecuta 5 pasos de flujo Euler para producir trayectorias de control.
- Ejecución en hardware de borde: los contextos QNN están compilados para el HTP v73 del QCS8550, lo que permite inferencia en placa sin GPU dedicada.
- Servidor nativo AArch64: el paquete incluye un servidor que escucha por defecto en el puerto 10196.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, modo thinking, audio ni otras capacidades generales de lenguaje, ya que el modelo está especializado en robótica.

## Casos de uso

- Manipulación robótica en RoboCasa: el modelo está evaluado en 24 tareas de RoboCasa v0.2 con 100 episodios por tarea, por lo que es adecuado para reproducir y desplegar políticas de manipulación en entornos simulados de cocina doméstica.
- Robótica de borde en placas QCS8550: permite ejecutar la política en dispositivos embebidos con Qualcomm QCS8550 sin depender de una GPU, útil para prototipos de robots móviles o brazos con presupuesto térmico y energético limitado.
- Investigación en cuantización de modelos VLA: sirve como referencia para estudiar el impacto de W8A16 y de la división en contextos QNN sobre la precisión de una política robótica, comparando con la reproducción BF16 en RTX 4090.
- Validación de pipelines QAIRT/QNN 2.50: el paquete incluye manifiesto de placa, sumas de verificación y servidor nativo, lo que facilita probar la cadena de compilación y despliegue de Qualcomm en un caso real.
- Evaluación comparativa de tareas RoboCasa: al incluir resultados por tarea en el informe complementario, permite analizar en qué tareas concretas la migración a QNN mejora o degrada el rendimiento frente a BF16.
- Demostraciones de inferencia en tiempo real en hardware de bajo consumo: el servidor en el puerto 10196 puede integrarse en un bucle de control que envíe imágenes y estado del robot y reciba trozos de acción de 10 × 60.
- Reproducibilidad de resultados de investigación: al publicar checksums y un manifiesto de placa, facilita la verificación independiente de los resultados reportados (1.793 / 2.400 episodios, 74,71 %).

## Benchmarks y rendimiento

Los datos de evaluación corresponden a RoboCasa v0.2, con 24 tareas y 100 episodios por tarea (2.400 episodios en total).

| Ejecución | Resultado |
|---|---:|
| Resultado oficial del paper | 74,50 % |
| Resultados oficiales por episodio | 1.781 / 2.400 (74,21 %) |
| Reproducción BF16 en RTX 4090 | 1.782 / 2.400 (74,25 %) |
| Migración a QNN en QCS8550 | 1.793 / 2.400 (74,71 %) |

El autor señala que el paper oficial reporta un 74,5 % global, mientras que los recuentos de episodios por tarea publicados suman un 74,21 %. El informe complementario incluye los resultados por tarea y la configuración de evaluación. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Acelerador objetivo: Qualcomm QCS8550 con HTP v73; los contextos QNN están compilados específicamente para esta plataforma.
- Runtime: QAIRT/QNN 2.50 instalado en la placa; es necesario definir `QAIRT_ROOT` antes de ejecutar `./run_native.sh`.
- Servidor: binario nativo AArch64 incluido en el paquete; escucha por defecto en el puerto 10196 (configurable con la variable `PORT`).
- VRAM estimada: no disponible; el despliegue previsto es en el HTP del QCS8550, no en GPU.
- GPU recomendadas: no aplica para esta compilación; la referencia BF16 se evaluó en una RTX 4090, pero el paquete no está pensado para ejecutarse en GPU.
- ¿Cabe en GPU de consumo? No aplica: los binarios son contextos QNN para HTP v73, no pesos en formato estándar para llama.cpp, vLLM, TGI u Ollama.
- Opciones de despliegue: únicamente el servidor nativo AArch64 incluido, con QAIRT/QNN 2.50; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño del repositorio: 6,1 GB, que incluye los ocho contextos binarios, el manifiesto, los checksums y el servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento RoboCasa v0.2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi XR-1 RoboCasa (BF16) | no disponible | 288 tokens | 74,25 % (reproducción RTX 4090) | Apache-2.0 | Checkpoint upstream no incluido en este repo |
| sunwenme/xr1-robocasa-qcs8550-qnn | no disponible | 288 tokens | 74,71 % (QCS8550 QNN) | Apache-2.0 | Contextos QNN para QCS8550 |
| Otras políticas VLA para RoboCasa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El paquete no incluye el checkpoint BF16 original ni el dataset RoboCasa; solo contiene los contextos QNN compilados y artefactos de despliegue.
- La compilación está ligada al HTP v73 del QCS8550 y al runtime QAIRT/QNN 2.50; no es portable a otras GPUs, NPUs o versiones de runtime sin recompilación.
- El modelo está especializado en robótica de manipulación en RoboCasa; no se documentan capacidades generales de lenguaje, tool calling ni agentes.
- No hay información sobre sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo original.
- La licencia Apache-2.0 permite uso comercial, pero el runtime Qualcomm compatible se instala por separado bajo sus propios términos, que pueden imponer restricciones adicionales.
- El DiT se ejecuta en FLOAT sin cuantización explícita de pesos y las cinco actualizaciones Euler corren en el runtime del host, lo que puede afectar a la latencia en placas con CPU limitada.
- Los resultados reportados (74,71 %) corresponden a una única configuración de evaluación; no se documentan pruebas de robustez fuera de RoboCasa v0.2.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente más allá del informe del autor.

## Enlaces

- Hugging Face: https://huggingface.co/sunwenme/xr1-robocasa-qcs8550-qnn
- Informe complementario: https://github.com/sunwen-me/xr1-qcs8550-robocasa/blob/main/report.md
- Atribución y licencia: https://github.com/sunwen-me/xr1-qcs8550-robocasa/blob/main/NOTICE.md
