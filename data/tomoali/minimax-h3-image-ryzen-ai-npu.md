# Tomoali/MiniMax-H3-Image-ryzen-ai-npu

## Resumen

MiniMax-H3-Image-ryzen-ai-npu es una conversión no oficial del modelo de difusión texto-a-imagen MiniMax-H3-Image de MiniMax, empaquetada para ejecutarse sobre la NPU XDNA 2 de los procesadores AMD Ryzen AI. El autor, Tomoali, ha convertido el transformer de difusión, las proyecciones del decodificador VAE y el refinador de tokens a formato ONNX con cuantización int4 asimétrica, empleando Ryzen AI Software 1.8.0. El objetivo es permitir la generación de imágenes a 1024×1024 en hardware de consumo con NPU integrada, sin recurrir a GPU dedicada.

El modelo base MiniMax-H3-Image es un modelo de difusión de seis pasos para texto-a-imagen a 1024×1024. Esta conversión conserva la arquitectura original pero redistribuye la carga de cómputo: las proyecciones del DiT y del decodificador se ejecutan en la NPU, mientras que el codificador de texto y parte de la atención del decodificador se ejecutan en CPU. El repositorio ocupa 20,7 GB y contiene únicamente los pesos convertidos; el codificador de texto, el tokenizador y los ficheros VAE originales deben descargarse aparte desde los repositorios de MiniMax (56,04 GB adicionales).

La relevancia de esta ficha radica en que ejemplifica el despliegue de modelos generativos de gran tamano en NPUs de consumo, un nicho emergente frente al dominio de las GPU. No obstante, se trata de un artefacto experimental sin descargas ni validación comunitaria, con latencias de varios minutos por imagen y una licencia restrictiva que excluye explícitamente a la Unión Europea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con VAE y refinador de tokens; conversión ONNX para NPU XDNA 2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 asimétrico en proyecciones DiT y VAE (entradas/salidas bf16); refinador en dtypes originales |
| Idiomas soportados | no disponibles |
| Licencia | MiniMax-H3-Image Community License Agreement (territorio excluye UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | ONNX (onnxruntime); grafos compilados para NPU |
| Resolucion de salida | 1024×1024 |
| Pasos de muestreo | 6 |
| Tamano del repositorio | 20,7 GB (21,81 GB segun manifest) |
| Dependencias externas | Codificador de texto, tokenizador y VAE originales (56,04 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusión (DiT) de 50 capas para la generación de imágenes, acompanado de un VAE de 24 capas para el decodificado y un refinador de tokens para el acondicionamiento. La conversión de Tomoali reorganiza estos componentes: cada capa del DiT contiene cuatro proyecciones lineales en int4 asimétrico con entradas y salidas en bf16, divididas por anchura y rellenadas con ceros hasta formas compatibles con los kernels de la NPU. La atención del DiT se ejecuta como un grafo DynamicDispatch de 24 cabezas en un marco fijo de 1.280 filas, requiriendo tres llamadas para cubrir las 56 cabezas totales; una pasada de atención sobre máscaras de validez gestiona el relleno.

El repositorio no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, si hubo RLHF o DPO), por lo que estos datos no están disponibles. La innovación técnica de esta conversión es la distribución del cómputo entre NPU y CPU: las proyecciones del DiT y del decodificador VAE se ejecutan en la NPU, mientras que la CPU transmite las capas 0–49 del codificador de texto, ejecuta el refinador de tokens y calcula la atención del decodificador sobre 25 mosaicos solapados. El decodificador VAE utiliza una atención DynamicDispatch compilada y tensores compartidos en `vae-common/`.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024×1024 en seis pasos de muestreo.
- Renderizado de texto dentro de la imagen: en las pruebas del autor, cinco de seis prompts mostraron el texto solicitado correctamente.
- Ejecución íntegra en NPU más CPU sin uso de GPU (utilización del motor GPU del 0 % durante la generación).
- Reproducibilidad parcial: misma semilla y prompt producen el mismo latente en la mayoría de ejecuciones, aunque no siempre (20 de 27 coincidencias bit a bit).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad de entrada.
- No se documentan capacidades multilingües más allá del renderizado de texto en imagen (incluye ejemplos con caracteres japoneses).

## Casos de uso

- Generación de ilustraciones en equipos sin GPU dedicada: el modelo permite crear imágenes a 1024×1024 en portátiles con Ryzen AI y NPU XDNA 2, aprovechando la NPU para las proyecciones del DiT y liberando la GPU para otras tareas.
- Prototipado de assets para interfaces: con seis pasos de muestreo y resolución fija, resulta adecuado para generar mockups y elementos gráficos en flujos de diseno que no requieran latencia baja.
- Generación de tarjetas y material promocional con texto integrado: la capacidad de renderizar texto en imagen (validada en cinco de seis prompts) permite crear carteles, etiquetas y tarjetas con texto legible sin post-procesado.
- Experimentación con cuantización int4 en NPU: sirve como referencia técnica para investigadores que estudien el rendimiento de proyecciones int4 asimétricas y grafos DynamicDispatch en XDNA 2.
- Despliegue en entornos con restricciones de consumo energético: al no usar GPU y mantener un solo procesador lógico ocupado de media (ratio CPU/tiempo real de 0,92), encaja en escenarios donde la eficiencia energética prima sobre la latencia.
- Docencia y demostraciones de difusión en hardware de consumo: permite ilustrar el funcionamiento de un DiT de seis pasos en un portátil, con tiempos de 368 s por imagen que hacen viable la demostración en vivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, FID, CLIP score, etc.) en la información disponible. El autor proporciona métricas de rendimiento de inferencia medidas en un Ryzen AI 7 PRO 350:

| Metrica | Valor |
|---|---|
| Tiempo total por imagen (1024×1024, 6 pasos) | 368 s (mediana de 6 ejecuciones; media 369 s; rango 352–389 s) |
| Inferencia DiT por paso | 28,6 s/paso |
| Creacion de sesion DiT por imagen | 105 s |
| Memoria privada pico (etapa codificador de texto) | 3,86 GB |
| Memoria compartida NPU | 1,92 GB (4,33 GB en el mismo instante) |
| Reduccion de memoria fisica libre | 4,05 GB |
| Utilizacion de GPU | 0 % |
| Ratio CPU/tiempo real | 0,92 (aprox. un procesador logico ocupado de media) |
| Reproducibilidad (misma semilla) | 20 de 27 latentes finales identicos bit a bit |

## Requisitos de hardware

- NPU: AMD XDNA 2 integrada en procesadores Ryzen AI, con driver actualizado (probado con driver 32.0.203.329).
- Sistema operativo: Windows 11 (requisito del stack Ryzen AI Software 1.8.0).
- Software: Ryzen AI Software 1.8.0 y los scripts del repositorio de GitHub.
- Memoria: el autor midió un pico de 4,33 GB de memoria compartida NPU más 3,86 GB de memoria privada; la generación se detiene si la memoria física libre baja de 5 GB (configurable). Se recomienda al menos 16 GB de RAM; la prueba se realizó con 32 GB.
- Almacenamiento: 21,81 GB para los pesos convertidos más 56,04 GB para el codificador de texto, tokenizador y VAE originales.
- GPU: no se utiliza; no es necesaria ninguna GPU dedicada.
- Opciones de despliegue: exclusivamente onnxruntime con Ryzen AI Software 1.8.0 mediante los scripts PowerShell del repositorio (`setup.ps1`, `doctor.ps1`, `gen.ps1`). No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 368 s por imagen de media; 28,6 s por paso de DiT; 105 s de creación de sesión por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Pasos | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3-Image-ryzen-ai-npu | no disponible | 1024×1024 | 6 | NPU XDNA 2 + CPU (Windows 11) | MiniMax Community (excluye UE, RU, KR, EE. UU.) | 0 descargas, experimental |
| MiniMax-H3-Image (base) | no disponible | 1024×1024 | 6 | GPU (formato original) | MiniMax Community | Oficial de MiniMax |
| Alternativas de difusion en NPU de consumo | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con otros modelos de difusión. La comparación se limita a aspectos de despliegue y licencia.

## Limitaciones y advertencias

- Licencia restrictiva: el territorio aplicable excluye la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos de América; el uso comercial en esos territorios no está permitido según los términos citados.
- Modelo no oficial: la conversión no está avalada por MiniMax ni por AMD; el autor la etiqueta explícitamente como no oficial.
- Reproducibilidad incompleta: en 7 de 27 ejecuciones con la misma semilla y prompt, el latente final difirió; el autor desconoce la causa.
- Errores en el renderizado de texto: en el prompt `price-tag` se generó りんど en lugar de りんご, un fallo que también reproduce la implementación fp32 de referencia.
- Latencia elevada: 368 s por imagen y 105 s de creación de sesión por imagen hacen inviable el uso interactivo.
- Dependencia de plataforma: requiere Windows 11, una NPU XDNA 2 y Ryzen AI Software 1.8.0; no funciona en Linux, macOS ni GPU convencionales.
- Artefacto sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros sobre su funcionamiento.
- Riesgo de alucinación visual: no se documentan métricas de fidelidad al prompt más allá de la prueba cualitativa de texto en imagen.
- Sin datos de sesgos: no se dispone de información sobre sesgos demográficos o culturales del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tomoali/MiniMax-H3-Image-ryzen-ai-npu
- Repositorio GitHub con código y configuración: https://github.com/tomhda/minimax-h3-image-ryzen-ai-npu
- Modelo base MiniMax-H3-Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Documentación de Ryzen AI Software 1.8.0: https://ryzenai.docs.amd.com/en/1.8/inst.html
