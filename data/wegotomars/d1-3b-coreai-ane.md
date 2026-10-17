# wegotomars/d1-3B-CoreAI-ANE

## Resumen

d1-3B-CoreAI-ANE es una conversión del modelo de decisión LiquidAI/d1-3B (3B parámetros) preparada por el usuario wegotomars para ejecutarse sobre la Apple Neural Engine (ANE) mediante Core AI, el stack de inferencia en dispositivo de Apple. No es un modelo nuevo entrenado desde cero, sino un artefacto de despliegue: tokenización, embeddings y lectura de opciones se ejecutan en CPU, mientras que el backbone se delega a la ANE. El runtime asociado es tinkerbox-ane.

El modelo pertenece a la categoría de modelos de decisión (tags: decision, classification, calibration, system-one) en lugar de la generación de texto abierta. Su API expone una función `system_one(texto, opciones)` que devuelve la opción seleccionada junto con su probabilidad, lo que lo sitúa como clasificador/selector con salida calibrada. El pipeline declarado en HuggingFace es `text-classification` y la librería, `coreai`.

La relevancia actual viene de su enfoque de despliegue: pesos en FP16 ejecutados íntegramente en la ANE de Apple Silicon, con una ventana de contexto de 32.768 tokens renderizados y nueve capacidades de caché que comparten un único conjunto de pesos. El autor reporta una concordancia del 100% en la respuesta principal frente al modelo FP32 oficial sobre 204 casos, con una deriva media de probabilidad de 0,000655.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada explícitamente; backbone de la familia Liquid (tags: liquid, lfm2.5). Conversión para Apple Neural Engine vía Core AI |
| Parametros totales | 3B (según denominación del modelo base LiquidAI/d1-3B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens renderizados; tamaño de chunk de 128 tokens |
| Tipos de cuantizacion | FP16 (pesos y assets convertidos). No se listan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | Assets convertidos para Core AI (repo de 4,9 GB); no se ofrecen safetensors ni GGUF |
| Libreria / runtime | coreai; runtime tinkerbox-ane |
| Pipeline | text-classification |
| Modelo base | LiquidAI/d1-3B |
| Checkpoint upstream | LiquidAI/d1-3B@051bcc464b01b9f92942b364d9586b0ef5912432 |
| Hash de origen | 2b64ab9d9d9a03dfa3476ab6ae33fa248eee97c9710e6f16f725e25db77e8629 |
| Requisitos de plataforma | macOS 27, Apple Silicon, almacenamiento APFS, Xcode 27 / Swift 6.4, Python 3.12 o 3.13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del backbone más allá de los tags del repositorio (liquid, lfm2.5, edge), que apuntan a la familia de modelos de LiquidAI. Lo que sí se especifica es la topología de despliegue: la tokenización, el cálculo de embeddings y la lectura de opciones se ejecutan en la CPU, mientras que el backbone se ejecuta en la Apple Neural Engine. El modelo opera con un tamaño de chunk de 128 tokens y admite hasta 32.768 tokens renderizados de contexto. Nueve capacidades de caché distintas comparten el mismo conjunto de pesos, de modo que el mismo artefacto cubre varios regímenes de memoria sin duplicar parámetros.

No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni sobre el proceso de conversión más allá del hash del checkpoint de origen y del hash de los assets generados. La operación de conversión es de fidelidad numérica: el autor compara la salida FP16 sobre ANE contra el modelo FP32 oficial, obteniendo una concordancia del 100% en la respuesta principal (204/204 casos) y una deriva absoluta de probabilidad de 0,000655 de media y 0,012448 en el peor caso.

## Capacidades

- Clasificación y decisión sobre opciones: la función `system_one` recibe un texto y un diccionario de opciones tipadas (por ejemplo, `{"refund": {"type": "noul", "instructions": "..."}}`) y devuelve la opción seleccionada.
- Salida calibrada: el modelo devuelve probabilidades asociadas a cada opción, con deriva controlada frente a la referencia FP32.
- Procesamiento de contexto largo: hasta 32.768 tokens renderizados, útil para decisiones que dependen de documentos extensos.
- Ejecución en dispositivo (edge): inferencia local en Apple Silicon sin dependencia de servicios en la nube.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo se describe como "system one", es decir, decisión directa en un solo paso.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Capacidades especiales: inferencia sobre Apple Neural Engine vía Core AI; chunking de 128 tokens; nueve capacidades de caché compartiendo pesos.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una reclamación, el modelo decide entre categorías predefinidas (reembolso, incidencia técnica, facturación). La latencia mediana de 38,9 ms para entradas de 26 a 251 tokens lo hace viable en línea.
- Clasificación de intención en asistentes conversacionales: con opciones tipadas se puede mapear cada turno del usuario a una acción concreta antes de invocar lógica de negocio, manteniendo los datos en el dispositivo.
- Triage de correo o mensajes entrantes: selección de la etiqueta o cola adecuada en un cliente de correo local para macOS, aprovechando que todo el cómputo ocurre en la ANE.
- Moderación y filtrado de contenido: decisión binaria o multietiqueta sobre fragmentos de texto, con probabilidad asociada para fijar umbrales de revisión humana.
- Decisión sobre documentos largos: análisis de contratos, informes o expedientes de hasta 32.768 tokens para responder preguntas de clasificación (por ejemplo, si un documento constituye una solicitud formal). La latencia a esa longitud es de 48,7 s, adecuada para procesos por lotes y no para interacción estricta.
- Evaluación de riesgo y scoring con calibración: al exponer probabilidades con baja deriva respecto a FP32, sirve para umbrales de decisión sensibles donde importa más la calibración que la generación libre.
- Preprocesado en pipelines de agentes: usar la salida del modelo como selector de la siguiente acción o herramienta antes de invocar un LLM generativo, reduciendo coste y latencia total.
- Aplicaciones de privacidad estricta: cualquier flujo en macOS donde el texto no pueda salir del equipo, como análisis de historiales médicos o financieros locales.

## Benchmarks y rendimiento

Métricas de fidelidad y latencia publicadas por el autor, medidas en un Apple M5 Pro (24 GB) con macOS 27.0.1 el 16 de octubre de 2026:

| Metrica | Resultado |
|---|---|
| Concordancia de la respuesta principal con el modelo FP32 oficial | 100% (204/204) |
| Deriva absoluta de probabilidad vs FP32, media / máxima | 0,000655 / 0,012448 |
| Latencia de una pregunta, 26–251 tokens de entrada, mediana / p95 | 38,9 ms / 79,0 ms |
| Latencia con 4.096 tokens, mediana | 1,56 s |
| Latencia con 32.768 tokens | 48,7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores corresponden únicamente a fidelidad de conversión y latencia de inferencia.

## Requisitos de hardware

- Plataforma obligatoria: macOS 27 sobre Apple Silicon con almacenamiento APFS. No se contempla ejecución en GPU NVIDIA ni en CPU x86.
- Hardware de referencia medido: Apple M5 Pro con 24 GB de memoria unificada.
- Memoria: el repositorio ocupa 4,9 GB en FP16; el modelo base es de 3B parámetros, por lo que el uso de memoria unificada debe cubrir pesos más cachés de contexto.
- Cabe en equipos de consumo: sí, en Apple Silicon (familias M) con memoria unificada suficiente, ya que el cómputo se delega a la ANE.
- Cadena de herramientas: Xcode 27, Swift 6.4 y Python 3.12 o 3.13; el runtime es tinkerbox-ane.
- Opciones de despliegue: Core AI con el runtime tinkerbox-ane. No se documentan rutas vLLM, llama.cpp, Ollama ni TGI, ni formatos GGUF.
- Latencia y throughput: una pregunta corta (26–251 tokens) tarda 38,9 ms de mediana y 79,0 ms en p95; 4.096 tokens tardan 1,56 s de mediana; 32.768 tokens tardan 48,7 s. No se publica throughput en tokens por segundo ni rendimiento en lote.

Ejemplo de uso según la model card:

```python
from tinkerbox_ane import d1

with d1.load() as model:
    result = model.system_one(
        "I was charged twice this month.",
        {"refund": {"type": "noul", "instructions": "Is this a refund request?"}},
    )
    print(result)
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wegotomars/d1-3B-CoreAI-ANE | 3B | 32.768 tokens renderizados | Apple Neural Engine (Core AI, tinkerbox-ane) | LFM Open License v1.0 | 0 descargas, 0 likes; repo de 4,9 GB |
| LiquidAI/d1-3B | 3B | No disponible en la información proporcionada | Checkpoint original en FP32 (GPU/CPU) | No disponible en la información proporcionada | Modelo base referenciado en la model card |
| Alternativas de la misma categoría (clasificadores de decisión en edge) | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación con datos concretos disponible es la del propio autor frente al modelo FP32 oficial, que arroja una concordancia del 100% en la respuesta principal (204/204) y una deriva media de probabilidad de 0,000655. No se dispone de datos objetivos para comparar con otros modelos de decisión de terceros.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se publica ninguna evaluación de sesgo del modelo base ni de la conversión.
- Riesgo de alucinación: el modelo no genera texto libre, sino que selecciona entre opciones proporcionadas; el riesgo se traslada a elegir una opción incorrecta con alta confianza. Se recomienda fijar umbrales sobre la probabilidad devuelta.
- Limitación de contexto: el máximo es de 32.768 tokens renderizados y el procesamiento se realiza por chunks de 128 tokens. A esa longitud la latencia alcanza 48,7 s, poco apta para interacción en tiempo real.
- Idiomas: no declarados en el repositorio; se desconoce si el rendimiento es uniforme entre lenguas.
- Licencia: LFM Open License v1.0 (etiquetada como `license: other`). Es una licencia propia, no OSI, por lo que conviene revisar el archivo LICENSE y el NOTICE antes de cualquier uso comercial. No se ofrecen aquí los términos concretos.
- Plataforma: dependencia estricta de macOS 27 y Apple Silicon; requiere Xcode 27, Swift 6.4 y Python 3.12 o 3.13. No es desplegable en Linux, Windows ni en aceleradores NVIDIA.
- Madurez: el repositorio registra 0 descargas y 0 likes, y las métricas publicadas provienen exclusivamente del autor del artefacto, sin validación independiente.
- Formatos: no se distribuyen safetensors ni GGUF, lo que impide su uso con ecosistemas de inferencia convencionales.
- Integridad: los hashes de checkpoint de origen y de assets se publican en la model card; conviene verificarlos antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wegotomars/d1-3B-CoreAI-ANE
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Core AI (Apple Developer): https://developer.apple.com/core-ai/
- Documentación de licencia en el repositorio: LICENSE
- Aviso legal y atribuciones: NOTICE
