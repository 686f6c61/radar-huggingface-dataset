# Stemson-AI/cimp-denoise

## Resumen

cimp-denoise es un conjunto de pesos publicado por Stemson-AI para la herramienta `denoise` del paquete homónimo, orientado a la reducción de ruido en imágenes de microscopía electrónica de transmisión por barrido (STEM). El modelo no es un LLM ni un modelo de lenguaje: es un sistema de restauración de imagen que renderiza un fotograma ruidoso como se vería tras una exposición más larga, es decir, sintetiza la apariencia de una adquisición con mayor tiempo de integración a partir de una captura corta.

Técnicamente se compone de dos piezas: un denoiser basado en flow matching condicional con arquitectura U-Net (denominado `x2x`) y un codificador congelado llamado CMMP que describe una adquisición a partir de sus metadatos (siete números) o de la propia imagen. El repositorio incluye cuatro ficheros de pesos (`cmmp.pt`, `x2x.pt`, `x2x_cmmp.pt` y `supervised.pt`) que cubren dos modos de operación: modo metadatos y modo CMMP.

Es relevante para investigadores en microscopía electrónica que trabajan con dosis limitadas por daño al espécimen: permite obtener una imagen con aspecto de exposición larga sin pagar el coste de una adquisición prolongada, con tiempos de inferencia declarados de unos 5 s para 512×512 px y unos 90 s para 2048×2048 px en una GPU de escritorio. El repo ocupa 0,3 GB y la licencia es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con flow matching condicional; codificador CMMP congelado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.pt` (PyTorch) |
| Tamano del repositorio | 0,3 GB |
| Modalidad | Imagen STEM (HAADF entrenado; BF y DF procesados pero no entrenados) |
| Resolucion minima de entrada | 128 px por lado |
| Muestreo por defecto | 8 draws × 4 pasos de sampler |

## Arquitectura y entrenamiento

El denoiser principal es un modelo de flow matching condicional con backbone U-Net, identificado en la model card como `x2x`. La tarea aprendida es transformar un fotograma ruidoso en su equivalente tras una exposición más larga, lo que en la práctica equivale a una denoising condicionada por la adquisición. Existen dos variantes del denoiser: `x2x.pt`, en modo metadatos, derivada de `x2x_v2_local` en la época 500, y `x2x_cmmp.pt`, en modo CMMP, derivada de `x2x_v3_imgsrc` en la época 100 y entrenada además con embeddings de imagen de CMMP como fuentes.

El codificador CMMP (`cmmp.pt`) es un par congelado que describe una adquisición a partir de sus metadatos (siete números) o directamente de la imagen. En modo metadatos, el sistema toma el menor valor entre el dwell registrado y 1 µs y lo escala por 16 para fijar el objetivo de exposición; en modo CMMP solo necesita la imagen. El cuarto fichero, `supervised.pt` (derivado de `sup_v1`, época 100), es un denoiser supervisado que aporta el objetivo de "aspecto limpio" en modo CMMP. No se detallan en la información disponible el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO, algo por otra parte esperable en un modelo de imagen.

## Capacidades

- Reducción de ruido en imágenes STEM: renderiza un fotograma como se vería tras una exposición más larga.
- Condicionamiento por metadatos de adquisición: modo metadatos para ficheros Velox `.emd`, usando dwell registrado acotado a 1 µs y escalado ×16.
- Condicionamiento por imagen: modo CMMP, que funciona sin metadatos y solo requiere la imagen de entrada.
- Procesamiento de canales HAADF (entrenado), BF y DF (soportados en inferencia pero no entrenados).
- Integración como comando de línea de comandos (`denoise frame.emd`) con descarga automática de pesos a `~/.cache/cimp-denoise`.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Adquisición de bajo voltaje y baja dosis: en muestras sensibles al haz, se captura un fotograma corto y el modelo genera la apariencia de una exposición 16 veces mayor, reduciendo el daño acumulado al espécimen. Es el caso de uso central del modelo.
- Revisión rápida en sesión de microscopio: con 5 s por imagen de 512×512 px en GPU de escritorio, el operador puede inspeccionar visualmente el resultado denoised durante la propia sesión antes de decidir si repite la captura.
- Recuperación de datasets históricos: ficheros Velox `.emd` con metadatos de dwell pueden procesarse en modo metadatos sin reentrenamiento, lo que permite reprocesar adquisiciones ya existentes.
- Flujos sin metadatos: cuando los metadatos de adquisición no están disponibles o son inconsistentes, el modo CMMP procesa la imagen directamente, útil en datos exportados o convertidos entre formatos.
- Preprocesado para análisis cuantitativo posterior: la imagen denoised sirve como entrada a pipelines de segmentación, medición de distancias de red o detección de defectos donde el ruido degrada la métrica.
- Procesamiento por lotes en estación de trabajo: con 90 s por imagen de 2048×2048 px, es viable ejecutar el modelo sobre conjuntos medianos en una GPU de escritorio durante la noche.
- Comparación de canales: aunque el modelo no se entrenó con BF ni DF, permite procesar esos canales para inspección cualitativa, con las cautelas indicadas en limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara tiempos de inferencia: aproximadamente 5 s por imagen de 512×512 px y 90 s por imagen de 2048×2048 px en una GPU de escritorio, con la configuración por defecto de 8 draws × 4 pasos de sampler.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El repo de pesos ocupa 0,3 GB, pero el consumo en inferencia depende de la resolución de entrada y del número de draws.
- GPU recomendadas: no se especifican modelos concretos; la model card solo indica "desktop GPU" para los tiempos declarados.
- GPU de consumo: no se confirma compatibilidad explícita con RTX 4090 u otras tarjetas de consumo, aunque los tiempos indicados (5 s a 512×512 px) son compatibles con una GPU de escritorio de gama alta.
- Opciones de despliegue: paquete Python instalable desde GitHub (`pip install git+https://github.com/benke97/cimp-denoise`) y comando `denoise`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 5 s por 512×512 px y 90 s por 2048×2048 px con 8 draws × 4 pasos de sampler en GPU de escritorio.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de denoising para STEM ni datos que permitan una comparación cuantitativa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenado únicamente con datos HAADF de un solo microscopio: la generalización a otros instrumentos, condiciones de aberración o configuraciones de detector no está garantizada.
- Los canales BF y DF se procesan, pero los modelos no se entrenaron con ellos; los resultados en esos canales deben tratarse como no validados.
- Las franjas de red muy tenues, cercanas al nivel de ruido, pueden suavizarse y perderse, lo que es crítico si el análisis posterior depende de esas frecuencias.
- Resolución mínima de 128 px por lado; no se especifica el comportamiento por debajo de ese umbral.
- El modo metadatos aplica un objetivo fijo de ×16 sobre min(dwell registrado, 1 µs), lo que puede no corresponder a la exposición deseada en adquisiciones con dwell superior a 1 µs.
- Riesgo de alucinación estructural: al ser un modelo generativo de flow matching, puede introducir o eliminar detalle no presente en la adquisición original; no debe usarse como sustituto de una medición cuantitativa sin validación.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene revisar los términos de la licencia del código asociado en el repositorio de GitHub, que puede diferir.
- Sin métricas publicadas de PSNR, SSIM ni validación con ground truth en la información disponible, lo que dificulta evaluar la fidelidad del resultado antes de desplegarlo en producción científica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stemson-AI/cimp-denoise
- Código del paquete: https://github.com/benke97/cimp-denoise
