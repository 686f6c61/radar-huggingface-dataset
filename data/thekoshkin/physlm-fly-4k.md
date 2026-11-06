# thekoshkin/physlm-fly-4k

## Resumen

PhysLM fly-4k es una red neuronal recurrente de 4.000 unidades entrenada como modelo de lenguaje a nivel de carácter sobre el conjunto de datos TinyStories. Lo desarrolla el autor independiente thekoshkin como primer paso del proyecto PhysLM, una línea de investigación que se pregunta si la generación de lenguaje puede ser el comportamiento natural de un sistema físico (relajación, fluctuaciones, oscilaciones) en lugar de una secuencia larga de operaciones digitales. El modelo tiene 4.025.263 parámetros y se distribuye en formato safetensors con licencia Apache 2.0.

La característica diferencial es la restricción del núcleo recurrente a operaciones con contrapartida directa en circuitos analógicos: sumas ponderadas con un número acotado de entradas (400 por unidad), no linealidades saturantes (tanh), una compuerta multiplicativa sigmoide y una integración con fuga de constantes de tiempo fijas y no entrenadas. No hay atención, ni capas de normalización, ni constantes de tiempo aprendidas. El objetivo declarado es servir como artefacto de investigación para estudiar dinámicas recurrentes, ruido de dispositivo y cuantización en hardware no convencional, no como modelo de producción.

El checkpoint es una simulación software en float32: no se ha implementado en hardware ni se le han aplicado no idealidades físicas. Está entrenado sobre unos 30 millones de caracteres y, según el autor, predice texto de forma comparable a un transformer de 0,8 M de parámetros con su propio tokenizador (0,884 frente a 0,885 bits por carácter en las primeras 1.024 historias de validación). El modelo fue diseñado, entrenado, evaluado y documentado por agentes de IA (Claude Code y una sesión de chat de Claude, de Anthropic).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente (RNN) modular con compuerta multiplicativa, integración con fuga de tasa fija y unidades tanh; sin atención ni normalización |
| Parametros totales | 4.025.263 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana fija; las 800 unidades lentas integran sobre aproximadamente 3 a 330 caracteres |
| Tipos de cuantizacion | No disponible (checkpoint publicado en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

El modelo es una RNN de 4.000 unidades organizadas en módulos con un número fijo de entradas (400 por unidad), de modo que el coste de un paso crece linealmente con el número de unidades. Cada unidad aplica únicamente operaciones con equivalente en circuito: suma ponderada acotada, tanh saturante, compuerta sigmoide multiplicativa e integración con fuga con constantes de tiempo fijas y no entrenadas. El cableado es aleatorio y modular, no copiado del conectoma de la mosca de la fruta; el nombre «fly-4k» alude a la ruta de escalado del proyecto hacia las 139.255 neuronas del cerebro adulto de Drosophila (FlyWire, Dorkenwald et al., 2024), de las que este modelo es el primer paso. La lectura final y el muestreo son digitales.

El entrenamiento se realizó sobre unos 30 millones de caracteres de TinyStories, en una sola laptop durante 2,9 horas. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por preferencias; el objetivo es modelado de lenguaje a nivel de carácter. En la comparación pre-registrada, el cableado modular igualó al aleatorio dentro del margen establecido (0,884 con una semilla modular frente a 0,886 ± 0,002 con tres semillas de cableado aleatorio). Existe una versión de 16.000 unidades del mismo tipo de celda ya entrenada, pendiente de publicación tras sus experimentos de control.

## Capacidades

- Generación de texto a nivel de carácter en inglés, con salida de historias simples y a menudo incoherentes.
- Modelado de lenguaje autorregresivo carácter a carácter mediante dinámica recurrente.
- Memoria recurrente de corto y medio plazo: las 800 unidades lentas integran información de aproximadamente 3 a 330 caracteres.
- Estudio de dinámicas recurrentes rápidas y lentas en un modelo pequeño y reproducible.
- Simulación de ruido de dispositivo, cuantización y desajuste (mismatch) sobre el núcleo recurrente.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Investigación en computación analógica y neuromórfica: el modelo sirve como banco de pruebas para estudiar cómo se comporta un núcleo recurrente restringido a operaciones con contrapartida en circuito cuando se le añaden ruido, cuantización y desajuste de dispositivos, antes de plantear una implementación física.
- Estudio de dinámicas recurrentes: sus 800 unidades lentas con constantes de tiempo fijas permiten analizar la separación entre dinámica rápida y lenta en un modelo de lenguaje de 4 M de parámetros que se entrena en una laptop en menos de 3 horas.
- Docencia en modelos de lenguaje: su tamaño (16 MB), su código autocontenido y su script de evaluación de unos 6 minutos en GPU de portátil Apple Silicon lo hacen adecuado para cursos sobre RNN, modelado a nivel de carácter y entrenamiento de bajo coste.
- Reproducibilidad y experimentos de control: al ser un artefacto pequeño y abierto (Apache 2.0), permite replicar la comparación entre cableado modular y aleatorio, o entre esta celda y un transformer de tamaño similar, con presupuesto mínimo.
- Pruebas de cuantización de bajo nivel: sirve para medir el impacto del redondeo y la reducción de precisión en un núcleo recurrente sin atención ni normalización, donde los errores pueden acumularse a lo largo de la recurrencia.
- Generación de historias sintéticas simples para pruebas de pipeline: puede producir texto estilo TinyStories para validar tokenizadores, formateadores o sistemas de evaluación de modelos de lenguaje a pequeña escala, asumiendo baja coherencia.
- Prototipado de arquitecturas híbridas analógico-digitales: el diseño modular con número fijo de entradas por unidad facilita mapear el modelo a simuladores de circuitos o a sustratos de hardware emergentes.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Modelado de lenguaje a nivel de carácter | TinyStories validación, primeras 1.024 historias | Bits por carácter (menor es mejor) | 0,8838 |
| Modelado de lenguaje a nivel de carácter | TinyStories validación, historias 1.025-3.430 | Bits por carácter (menor es mejor) | 0,9192 |

Comparaciones citadas por el autor en la model card (no incluidas en el model-index):

| Modelo | Bits por carácter (primeras 1.024 historias) | Notas |
|---|---|---|
| PhysLM fly-4k | 0,884 | 4,0 M parámetros, nivel de carácter |
| Transformer de 0,8 M con tokenizador propio | 0,885 | Mismo dato de entrenamiento (30 M caracteres), sin ajustar |
| Transformer a nivel de carácter de 1,9 M | 1,035 y 1,093 | Dos ejecuciones |
| TinyStories-1M (arquitectura) sobre los datos de este modelo | 0,840 | Aísla parte del efecto de los datos |

El autor señala que aproximadamente 0,07 de la brecha de 0,11 frente a TinyStories-1M corresponde a los datos de entrenamiento, y que el coste de las restricciones arquitectónicas no se ha aislado.

## Requisitos de hardware

- VRAM estimada: el checkpoint en float32 ocupa unos 16 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU dedicada; el autor reporta ejecución en CPU y evaluación en GPU de portátil Apple Silicon (PyTorch MPS) en unos 6 minutos.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) y en CPU.
- Opciones de despliegue: script propio `physlm_fly.py` con PyTorch y safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica; el coste por paso crece linealmente con el número de unidades y el modelo es de 4 M de parámetros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (bpc) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhysLM fly-4k | 4,0 M | Recurrencia de ~3-330 caracteres en unidades lentas | 0,884 / 0,919 | Apache 2.0 | Hugging Face |
| Transformer de 0,8 M (referencia del autor) | 0,8 M | No disponible | 0,885 | No disponible | No disponible |
| Transformer a nivel de carácter de 1,9 M (proyecto) | 1,9 M | No disponible | 1,035 / 1,093 | No disponible | No disponible |
| TinyStories-1M | ~1 M | No disponible | 0,840 (sobre los datos de este modelo) | No disponible en la información | No disponible en la información |

## Limitaciones y advertencias

- El propio autor indica que el modelo escribe historias simples y a menudo incoherentes y que no está pensado para ninguna aplicación.
- Es una simulación software en float32: no se ha construido en hardware ni se han aplicado no idealidades físicas, por lo que la hipótesis de computación analógica no está demostrada con este checkpoint.
- Solo soporta inglés y opera a nivel de carácter, sin tokenizador BPE; no hay soporte multilingüe.
- No dispone de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Riesgo elevado de alucinación y de texto sin sentido fuera del dominio de TinyStories (historias infantiles simples).
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; el corpus TinyStories es sintético y de dominio muy acotado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es adecuado para producción por su calidad y su naturaleza de artefacto de investigación.
- Los benchmarks del model-index están marcados como no verificados y proceden del propio autor, con una sola ejecución en el caso del transformer de referencia.
- El modelo fue diseñado, entrenado, evaluado y documentado por agentes de IA, lo que conviene tener en cuenta al interpretar la documentación.
- No se documentan cuantizaciones publicadas ni soporte en frameworks de inferencia estándar (vLLM, llama.cpp, Ollama, TGI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thekoshkin/physlm-fly-4k
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper del mismo proyecto (Koshkin, 2026): https://doi.org/10.5281/zenodo.23945050
- Referencia del conectoma FlyWire (Dorkenwald et al., 2024), citada en la model card: no disponible como enlace directo en la información proporcionada
- Repositorio de código: incluido en el propio repositorio de Hugging Face (`physlm_fly.py`)
