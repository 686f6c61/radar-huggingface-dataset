# tencent/Hy-Nomas

## Resumen

Hy-Nomas es un modelo de generación de vídeo desarrollado por Tencent que se presenta como un "world model" interactivo: genera un mundo virtual de forma continua, segmento a segmento, aceptando instrucciones de texto libre y control de cámara a lo largo de la generación. A diferencia de los modelos text-to-video de una sola pasada, Hy-Nomas mantiene el contexto entre segmentos mediante una caché KV persistente, lo que permite introducir objetos, cambiar de estilo o escena, describir acciones y reorientar la cámara sin reiniciar la generación.

Técnicamente combina un diffusion transformer (DiT) autorregresivo por segmentos con 54 bloques MMDiT de doble flujo, un codificador de texto Qwen, módulos de condicionamiento de cámara y un decodificador de vídeo PixelUMM ajustado. La configuración destilada genera cada segmento con 8 pasos de denoising a 720 × 1280 y 24 FPS. El repositorio ocupa 196,4 GB y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial.

Su relevancia actual radica en que aborda la generación de vídeo interactiva y con memoria espacial, un paso más allá del text-to-video convencional, y lo acompaña de un benchmark específico (Hy-Nomas-Bench) con 280 casos de prueba para evaluar controlabilidad y consistencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) autorregresivo por segmentos, 54 bloques MMDiT de doble flujo con atención conjunta causal por segmento, cross-attention de cámara y caché KV persistente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (contexto persistente entre segmentos vía caché KV) |
| Tipos de cuantizacion | INT8 (pesos DiT y caché KV), FP8 (decodificador) en la configuración de GPU única |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusion-single-file, diffusers) |

## Arquitectura y entrenamiento

Hy-Nomas realiza la difusión en un espacio latente de vídeo comprimido (latentes DCAE-V) y la autorregresión a través de segmentos de vídeo. Cada nuevo segmento parte de ruido gaussiano en ese espacio latente y se condiciona con texto, trayectoria de cámara e historial almacenado en una caché KV persistente. El bloque principal son 54 bloques MMDiT de doble flujo con atención conjunta causal por segmento, modulación por timestep y cross-attention dedicada a la cámara. El condicionamiento textual usa el componente de modelo de lenguaje de Qwen2.5-V, y el decodificador de vídeo por defecto es un PixelUMM ajustado.

La inferencia está destilada a 8 pasos de denoising por segmento, con salida a 720 × 1280 y 24 FPS. Existe además una configuración para GPU única (RTX 4090) que emplea pesos DiT en INT8, caché KV en INT8, decodificador en FP8 y offload a CPU. No se han facilitado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de vídeo text-to-video a 720 × 1280 y 24 FPS.
- Interacción libre multi-turno: instrucciones sucesivas sobre sujetos, acciones, apariencia, estilo y entorno.
- Control de cámara mediante trayectorias suministradas junto al texto (punto de vista y movimiento).
- Generación continua con memoria: reutilización del contexto previo vía caché KV para extender el mismo mundo.
- Control combinado de texto y cámara de forma intercalada.
- Memoria espacial: consistencia de la escena a lo largo de la generación.
- Inferencia destilada de 8 pasos para reducir coste por segmento.
- Despliegue flexible: configuración con paralelismo de secuencia o configuración de GPU única.

## Casos de uso

- Previsualización de escenarios para cine y videojuegos: el modelo permite construir un entorno segmento a segmento y reorientar la cámara sobre la marcha, útil para prototipar planos sin renderizado 3D tradicional.
- Generación de vídeo interactiva en demos y experiencias web: la demo oficial y la caché KV permiten sesiones donde el usuario modifica el mundo en tiempo real mediante texto y control de cámara.
- Creación de contenido para redes y publicidad: la salida a 720 × 1280 y 24 FPS encaja en formatos verticales y horizontales, con cambios de estilo y escena sin reiniciar la generación.
- Simulación de entornos para entrenamiento de agentes: la memoria espacial y el control de cámara permiten generar trayectorias de navegación consistentes para investigación en robótica o conducción simulada.
- Investigación en world models: el modelo y su benchmark Hy-Nomas-Bench (280 casos) sirven para evaluar controlabilidad y consistencia en generación de mundo continua.
- Prototipado rápido en estudios pequeños con hardware consumer: la configuración de GPU única con INT8/FP8 y offload a CPU permite ejecutar el modelo en una RTX 4090.
- Evaluación comparativa de modelos de vídeo: el benchmark publicado facilita la comparación estandarizada de sistemas interactivos de generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor publica Hy-Nomas-Bench (280 casos en cuatro suites: interacción libre multi-turno, navegación de cámara, control intercalado de texto y cámara, y memoria espacial), pero no se incluyen en la información proporcionada las puntuaciones obtenidas por el modelo ni comparaciones numéricas con alternativas.

## Requisitos de hardware

- Configuración estándar: paralelismo de secuencia, orientada a despliegue multi-GPU; el tamaño del repositorio es de 196,4 GB, por lo que requiere almacenamiento amplio y VRAM agregada elevada (valor exacto no disponible).
- Configuración de GPU única: soportada oficialmente en una NVIDIA GeForce RTX 4090 con pesos DiT en INT8, caché KV en INT8, decodificador en FP8 y offload a CPU.
- GPU recomendadas: RTX 4090 para la configuración de GPU única; para la configuración estándar se requieren varias GPU (modelos concretos no disponibles).
- Cabe en GPU consumer: sí, en una RTX 4090 mediante la configuración cuantizada con offload.
- Opciones de despliegue: librería diffusion-single-file/diffusers, demo web oficial; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles; se conoce que la inferencia destilada usa 8 pasos de denoising por segmento a 720 × 1280 y 24 FPS.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de modelos alternativos de generación de vídeo interactiva que permitan una comparación numérica rigurosa. La comparativa queda como no disponible.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos en la información disponible; al ser un modelo generativo de vídeo, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación visual: inconsistencias de objetos, física o escena entre segmentos pese a la caché KV.
- El contexto entre segmentos es persistente pero finito; generaciones muy largas pueden degradar la consistencia.
- Idiomas soportados no especificados; el condicionamiento textual depende del codificador Qwen2.5-V, pero no se detalla cobertura lingüística.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones de los componentes de terceros (Qwen, PixelUMM).
- La configuración de GPU única exige cuantización INT8/FP8 y offload a CPU, con posible impacto en calidad y velocidad.
- El tamaño del repositorio (196,4 GB) complica el despliegue en entornos con almacenamiento limitado.
- No hay datos publicados de benchmarks en la información disponible, lo que dificulta validar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy-Nomas
- Licencia: https://huggingface.co/tencent/Hy-Nomas/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy-Nomas/blob/main/README_CN.md
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-Nomas
- Informe técnico (arXiv): https://arxiv.org/abs/2610.36729
- Benchmark Hy-Nomas-Bench: https://huggingface.co/datasets/tencent/Hy-Nomas-Bench
- Sitio del proyecto y demo: https://hy-nomas.hy.tencent.com/
- Publicación en X: https://x.com/TencentHunyuan/status/2113676827114053892
