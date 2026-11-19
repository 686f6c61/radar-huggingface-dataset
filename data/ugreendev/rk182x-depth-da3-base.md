# UGREENDEV/RK182X-DEPTH-DA3-BASE

## Resumen

RK182X-DEPTH-DA3-BASE es una conversión al formato RKNN del modelo Depth Anything 3 Base (DA3-BASE), publicada por UGREENDEV para su ejecución sobre las NPU Rockchip RK1820 y RK1828. No se trata de un modelo de lenguaje ni de un modelo generativo de texto: es un estimador de profundidad monocular que, dada una única imagen, produce un mapa de profundidad denso. La relevancia de esta ficha es acotada: documenta un artefacto de despliegue para hardware embebido, no un modelo nuevo.

El repositorio contiene únicamente los pesos convertidos y compilados para el runtime RKNN v1.1.0, junto con configuraciones, sumas SHA-256 y avisos de licencia. La configuración publicada es una sola: resolución de entrada de 280x280 píxeles, precisión fp16 y 8 núcleos NPU. El tamaño total del repositorio es de 0,2 GB, coherente con un modelo base de tamaño moderado y una única variante compilada.

El modelo subyacente, depth-anything/DA3-BASE, procede de Depth Anything 3, la familia de estimadores de profundidad de Depth Anything. Esta conversión interesa a quienes despliegan percepción de profundidad en dispositivos de borde con acelerador Rockchip, y no a quienes buscan un modelo de propósito general. Los datos de rendimiento, idiomas y entrenamiento del modelo fuente no se detallan en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fuente: Depth Anything 3 Base; arquitectura no detallada en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16 (única configuración publicada) |
| Idiomas soportados | no disponible (no aplica a la tarea de estimación de profundidad) |
| Licencia | Apache 2.0 (modelo fuente); los artefactos RKNN quedan sujetos además a las licencias de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); no se distribuyen safetensors ni GGUF |
| Tarea | depth-estimation (profundidad monocular de una sola imagen) |
| Resolución de entrada | 280x280 |
| Núcleos NPU | 8 |
| Chips soportados | RK1820, RK1828 |
| Runtime requerido | RKNN Runtime v1.1.0 (verificar con `rknn-smi -v`) |
| Modelo base | depth-anything/DA3-BASE |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo fuente DA3-BASE en los datos proporcionados: no se detalla si emplea un backbone transformer tipo DINOv2, un decodificador de profundidad denso ni la composición del dataset de entrenamiento. Tampoco se documentan procesos de ajuste fino, destilación ni técnicas de regularización empleadas por el autor original.

Lo que sí está documentado es el proceso de conversión: los pesos de DA3-BASE se han compilado al formato RKNN mediante RKNN Toolkit, con cuantización fp16 y una partición en 8 núcleos NPU para los chips RK1820 y RK1828. La entrada se fija a 280x280 píxeles y solo se admite estimación de profundidad sobre una única imagen. El repositorio incluye un fichero NOTICE con la atribución y las modificaciones introducidas en la conversión, y sumas SHA-256 para verificar la integridad de los artefactos antes del despliegue.

## Capacidades

- Estimación de profundidad monocular densa a partir de una única imagen RGB.
- Inferencia acelerada en NPU Rockchip RK1820 y RK1828 mediante el runtime RKNN v1.1.0.
- Ejecución en fp16 con reparto en 8 núcleos NPU.
- Verificación de integridad de los artefactos mediante SHA-256.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas, visión general ni audio.
- No soporta entradas multi-imagen ni vídeo: solo una imagen por inferencia.
- Capacidades multilingües: no aplica.

## Casos de uso

- Robótica móvil de bajo consumo: el modelo genera mapas de profundidad por fotograma para evitación de obstáculos en robots con SoC Rockchip RK1820/1828, donde no hay margen para una GPU dedicada y la NPU integrada ofrece el cómputo necesario en fp16.
- Cámaras inteligentes y videovigilancia: estimación de profundidad en el propio dispositivo para segmentar primer plano y fondo, habilitando detección de intrusiones por zona sin enviar vídeo a la nube.
- Drones y UAV ligeros: percepción de distancia relativa para aterrizaje y navegación a baja altitud, aprovechando el reducido tamaño del artefacto (0,2 GB) y la inferencia sobre NPU.
- Dispositivos de asistencia a la movilidad: detección de obstáculos cercanos en bastones o wearables con visión, donde la latencia de una pasada de 280x280 sobre 8 núcleos NPU es compatible con uso en tiempo real.
- Reconstrucción 3D en el borde: generación de mapas de profundidad por imagen que alimentan pipelines de fotogrametría o síntesis de vistas en dispositivos sin conectividad.
- Automatización industrial: inspección de profundidad en líneas de montaje con cámaras fijas, verificando alturas o presencia de piezas mediante mapas de profundidad densos.
- Prototipado en placas de desarrollo Rockchip: validación de pipelines de percepción antes de portar a hardware final, gracias a la verificación SHA-256 y a la configuración única publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error de profundidad (AbsRel, RMSE, delta), latencia ni throughput para los chips RK1820/RK1828.

## Requisitos de hardware

- Chips soportados: exclusivamente Rockchip RK1820 y RK1828. No se puede ejecutar en GPU NVIDIA, AMD ni en CPU convencional con este artefacto.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión del dispositivo con `rknn-smi -v` antes de ejecutar.
- Memoria: no disponible. El repositorio ocupa 0,2 GB, pero no se especifica el consumo de memoria en tiempo de ejecución.
- Precisión: fp16, 8 núcleos NPU.
- Resolución de entrada: fija a 280x280.
- Opciones de despliegue: RKNN Toolkit y RKNN Runtime de Rockchip; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-DEPTH-DA3-BASE | RKNN | NPU Rockchip RK1820/RK1828 | 280x280 | Apache 2.0 | Hugging Face y ModelScope |
| depth-anything/DA3-BASE (original) | no disponible | GPU/CPU genéricos | no disponible | Apache 2.0 | Hugging Face |
| Otras conversiones RKNN de estimadores de profundidad | RKNN | NPU Rockchip | no disponible | variable | no disponible |

La comparación se limita al modelo fuente y a conversiones equivalentes, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo admite estimación de profundidad sobre una única imagen; no procesa vídeo ni múltiples vistas en una misma inferencia.
- La resolución de entrada está fijada a 280x280, lo que limita el detalle fino en escenas con objetos pequeños o bordes próximos.
- Dependencia estricta del runtime RKNN v1.1.0 y del driver correspondiente; una versión distinta puede provocar fallos de ejecución.
- Los artefactos son derivados convertidos, no los pesos originales de DA3-BASE; pueden presentar diferencias de precisión respecto al modelo fuente por la compilación y la cuantización fp16.
- La licencia Apache 2.0 del modelo fuente se mantiene, pero se añaden las licencias de RKNN Toolkit y RKNN Runtime, que no se incluyen en el paquete y deben obtenerse por separado.
- No se documentan sesgos, tasas de alucinación ni comportamiento en dominios específicos (interiores, exteriores, escenas nocturnas), por lo que la validación en el dominio de despliegue corre a cargo del integrador.
- El repositorio no incluye datos de benchmarks ni métricas de error de profundidad, lo que impide anticipar su precisión frente a alternativas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-DEPTH-DA3-BASE
- Modelo fuente: https://huggingface.co/depth-anything/DA3-BASE
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-DEPTH-DA3-BASE --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-DEPTH-DA3-BASE --revision v1.1.0`
- Documentación de la configuración: subdirectorio `DA3-BASE-280x280-fp16-8-1view/README.md` del repositorio
- Licencia: fichero `LICENSE` del repositorio (Apache 2.0)
- Atribución y modificaciones de conversión: fichero `NOTICE` del repositorio
