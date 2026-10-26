# vanshnawander/sapc2-moonshine-m24

## Resumen

`sapc2-moonshine-m24` es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario de Hugging Face vanshnawander, consistente en un ajuste fino del modelo Moonshine Tiny (27 M de parámetros) para el reto Speech Accessibility Project Challenge 2 (SAPC2). Su propósito es transcribir inglés hablado por personas con disartria asociada a ELA (esclerosis lateral amiotrófica), parálisis cerebral, síndrome de Down, enfermedad de Parkinson e ictus, un dominio en el que los sistemas ASR convencionales pierden decenas de puntos de precisión respecto al habla normotípica.

El modelo conserva la arquitectura encoder-decoder de Moonshine y se ha destilado desde el checkpoint `moonshine_tiny_step_0008541` con un peso de destilación de 0,5, partiendo de una inicialización recortada del propio Tiny (`m24_cut_from_tiny`). Cuenta con 23.768.064 parámetros reales según el fichero `model.safetensors` y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

Su relevancia práctica reside en que demuestra que un modelo de menos de 25 M de parámetros puede alcanzar un 23,76 % de WER en el conjunto Dev completo de SAPC2 (47.929 grabaciones) decodificando en unos 11 minutos en una GPU de consumo RTX 4050. Es, por tanto, una pieza interesante para integrar transcripción de habla atípica en dispositivos con recursos limitados o en flujos de accesibilidad en tiempo casi real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine (transformer encoder-decoder para ASR), ajustada desde Moonshine Tiny |
| Parametros totales | 23.768.064 (23,77 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de decodificacion de hasta 200 s en la evaluacion) |
| Tipos de cuantizacion | no disponible; el repo solo publica pesos en safetensors (entrenamiento en FP32 con autocast BF16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato Hugging Face, `transformers`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine, un transformer encoder-decoder orientado a reconocimiento de voz que procesa audio a resolución variable en lugar de forzar ventanas de 30 segundos. Este checkpoint concreto parte de una inicialización recortada del Moonshine Tiny (`m24_cut_from_tiny`) y aplica destilación de conocimiento desde el checkpoint `moonshine_tiny_step_0008541` con `kd_weight = 0.5`, es decir, combinando la pérdida supervisada sobre transcripciones SAPC2 con la distribución del profesor.

La receta de entrenamiento publicada especifica una sola época, `peak_lr = 3e-05`, muestreo balanceado con un máximo de 2 repeticiones por ítem (`balanced`, `balance_max_repeats = 2`) y una política de longitudes de 768 ítems, 4.608 segundos con padding, coste de atención 60.000 y 98.304 tokens de decodificador, con acumulación de gradiente 2 y semilla 20261022. El optimizador es "blocked SOAP" (Adam dentro de una eigenbase de Shampoo) con pesos en FP32 y autocast BF16. El código de entrenamiento, destilación, RL y evaluación vive en el paquete `moonshine` del repositorio del proyecto, con checkpoints reanudables.

## Capacidades

- Reconocimiento automático del habla en inglés sobre audio de una sola persona, con foco explícito en habla disártrica (ELA, parálisis cerebral, síndrome de Down, Parkinson, ictus).
- Transcripción de grabaciones de duración variable: la evaluación oficial cubre desde clips de 1-2 s hasta grabaciones de más de 35 s, con decodificación en ventanas de hasta 200 s.
- Salida de texto plano normalizado según el normalizador de la competición SAPC2 (minúsculas, sin puntuación significativa en las referencias evaluadas).
- Carga directa en `transformers` mediante `MoonshineForConditionalGeneration` o `CohereAsrForConditionalGeneration`, con procesador y tokenizer incluidos.
- No se documenta soporte de tool calling, function calling, capacidades de agente, visión, audio generativo ni modo "thinking": es un modelo puramente ASR.
- No se documenta multilingüismo: la model card declara únicamente inglés.

## Casos de uso

- Subtitulación accesible en tiempo casi real: el modelo transcribe habla disártrica con un WER del 19,58 % en ELA y del 19,21 % en Parkinson sobre el Dev completo, lo que lo hace utilizable para generar subtítulos en videollamadas o clases para personas con esas condiciones.
- Comunicación aumentativa y alternativa (AAC): integrado en una app de predicción de texto a partir de voz, el reducido tamaño (23,77 M de parámetros) permite ejecución local en portátiles o incluso en hardware embebido sin depender de la nube.
- Transcripción de entrevistas clínicas o de investigación: sesiones con participantes con parálisis cerebral o síndrome de Down pueden transcribirse por lotes; conviene revisar manualmente porque el WER en parálisis cerebral asciende al 35,84 %.
- Notas de voz personales para usuarios con movilidad reducida: el modelo convierte dictados domésticos en texto en una GPU de consumo, con un coste de decodificación de 11 minutos para 47.929 grabaciones en una RTX 4050.
- Investigación en accesibilidad del habla: sirve como línea base reproducible (semilla, receta y checkpoints publicados) para comparar técnicas de destilación y optimizadores (SOAP) en ASR de bajo número de parámetros.
- Preprocesado de corpus de habla atípica: generación de transcripciones preliminares para anotación humana posterior, con la ventaja de que el modelo cabe holgadamente en cualquier GPU y se puede ejecutar en paralelo en múltiples instancias.
- Filtrado y segmentación de audio a gran escala: dado su throughput, puede usarse para detectar grabaciones vacías o anómalas antes de pasarlas a un modelo mayor (la decodificación greedy del Dev completo produjo 0 salidas vacías y 213 recortadas por el límite de longitud).

## Benchmarks y rendimiento

Evaluación en Dev-1000 (subconjunto fijo de 1.000 grabaciones del Dev oficial, normalizador de la competición, mejor de las dos referencias). Mejor checkpoint: paso 1300 con 22,06 % WER y 15,15 % CER.

| Paso | WER Dev-1000 | CER Dev-1000 |
|---:|---:|---:|
| 100 | 46,66 % | 39,36 % |
| 200 | 32,69 % | 25,83 % |
| 300 | 27,93 % | 20,37 % |
| 400 | 25,62 % | 18,17 % |
| 500 | 23,94 % | 16,91 % |
| 600 | 24,89 % | 17,85 % |
| 700 | 23,56 % | 16,46 % |
| 800 | 23,08 % | 16,25 % |
| 900 | 22,93 % | 16,21 % |
| 1000 | 22,50 % | 15,36 % |
| 1100 | 22,39 % | 15,36 % |
| 1200 | 22,34 % | 15,52 % |
| 1300 | 22,06 % | 15,15 % |
| 1332 | 22,42 % | 15,68 % |

Dev completo (47.929 grabaciones), decodificación greedy con ventanas de 200 s:

| Metrica | Valor |
|---|---|
| WER | 23,76 % |
| CER | 16,87 % |
| Salidas vacias | 0 |
| Salidas recortadas por limite | 213 |
| Tiempo de decodificacion | 11 min en una RTX 4050 |
| Transcripciones exactas | 56,25 % |
| Sustituciones / deleciones / inserciones | 16,12 % / 3,32 % / 9,61 % de las palabras de referencia |
| WER sin limite de longitud | 29,05 % |

WER por duracion del audio:

| Duracion | Grabaciones | WER | Cuota de errores |
|---|---:|---:|---:|
| 1-2 s | 670 | 27,33 % | 0,37 % |
| 2-3 s | 4.354 | 16,93 % | 2,24 % |
| 3-5 s | 14.700 | 14,47 % | 8,65 % |
| 5-8 s | 14.739 | 18,37 % | 15,70 % |
| 8-12 s | 7.023 | 24,32 % | 14,35 % |
| 12-20 s | 3.867 | 29,20 % | 16,42 % |
| 20-35 s | 1.657 | 28,71 % | 15,60 % |
| >35 s | 919 | 32,73 % | 26,67 % |

WER por etiologia:

| Etiologia | Grabaciones | WER | Cuota de errores |
|---|---:|---:|---:|
| ELA | 10.232 | 19,58 % | 17,77 % |
| Paralisis cerebral | 11.472 | 35,84 % | 29,13 % |
| Sindrome de Down | 7.719 | 30,16 % | 14,88 % |
| Parkinson | 14.543 | 19,21 % | 33,22 % |
| Ictus | 3.963 | 21,89 % | 5,00 % |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precisión razonable. Con 23,77 M de parámetros, los pesos ocupan aproximadamente 95 MB en FP32, 48 MB en BF16 y 24 MB en int8; el cuello de botella es la caché de atención del decoder, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve; el autor reporta la decodificación del Dev completo (47.929 grabaciones) en 11 minutos en una RTX 4050 de portátil, lo que equivale a unas 72 grabaciones por segundo (la duración media del audio no se especifica).
- Cabe en GPU de consumo: sí, en toda la gama actual (RTX 3050/4050/4060/4090, GTX 16xx, e incluso iGPU con suficiente memoria compartida). También es viable en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `MoonshineForConditionalGeneration` o `CohereAsrForConditionalGeneration`. No se publican artefactos GGUF, ONNX ni recetas para vLLM, TGI, llama.cpp u Ollama en el repositorio; habría que generarlos a partir de los safetensors.
- Latencia y throughput: no se publican cifras de latencia por petición ni de RTF. El único dato disponible es el tiempo agregado de 11 minutos para 47.929 grabaciones en una RTX 4050 en modo greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | WER SAPC2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vanshnawander/sapc2-moonshine-m24` (este) | 23,77 M | ventanas de decodificacion de hasta 200 s | 23,76 % (Dev completo, greedy); 22,06 % (Dev-1000) | MIT | Hugging Face, safetensors |
| `vanshnawander/sapc2-moonshine-tiny-rl` | 27 M (Moonshine Tiny) | no disponible | no disponible | MIT (segun el autor) | Hugging Face |
| Moonshine Tiny (profesor, `moonshine_tiny_step_0008541`) | 27 M | no disponible | no disponible | MIT (familia Moonshine) | Hugging Face, `moonshine-ai/moonshine` |
| Moonshine Base | no disponible | no disponible | no disponible | MIT (familia Moonshine) | Hugging Face, `moonshine-ai/moonshine` |

No se han publicado resultados comparativos de estos modelos alternativos sobre SAPC2 en la información disponible; la comparación cuantitativa directa no es posible con los datos actuales.

## Limitaciones y advertencias

- Dominio muy restringido: solo inglés y solo habla SAPC2 (personas con las cinco etiologías del reto). No hay evidencia de que mantenga calidad en habla normotípica, acentos no estadounidenses, ruido de fondo o audio telefónico de banda estrecha.
- Sesgo por etiología: el WER en parálisis cerebral (35,84 %) duplica prácticamente el de ELA (19,58 %) y Parkinson (19,21 %). Un despliegue equitativo requeriría revisión humana en esos grupos.
- Peor rendimiento en grabaciones largas: el WER sube del 14,47 % en clips de 3-5 s al 32,73 % en audios de más de 35 s, que concentran el 26,67 % de todos los errores.
- Transcripciones desbocadas: 799 hipótesis (23,97 % de todos los errores) superan 1,5 veces la longitud de la referencia y 148 aparecen truncadas. En los casos más extremos el modelo alucina contenido completamente ajeno al audio (por ejemplo, habla de helado o de familiares cuando la referencia trata de una red social), lo que es un riesgo serio en cualquier uso clínico o legal sin supervisión.
- Normalización específica de la competición: las métricas se calculan con el normalizador SAPC2 y comparando contra la mejor de dos referencias, por lo que el WER es optimista respecto a un scorer estándar (el autor estima una diferencia de unas 0,1 décimas frente a SCTK, dentro de la misma metodología).
- Licencia MIT: permite uso comercial y modificación, pero al derivar de Moonshine conviene conservar los avisos de copyright originales y verificar los términos de la familia Moonshine en el uso combinado.
- Trazabilidad limitada: 22 descargas y 0 likes en el momento de la consulta, sin paper asociado ni evaluación independiente. El repositorio pesa 0,1 GB y las predicciones completas están en `evaluations/`, pero conviene reproducir la evaluación antes de usarlo en producción.
- No se documentan cuantizaciones oficiales ni límites de longitud de contexto máximos del modelo; los 200 s son la ventana usada en la evaluación, no una garantía de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnawander/sapc2-moonshine-m24
- Variante con RL sobre Moonshine Tiny: https://huggingface.co/vanshnawander/sapc2-moonshine-tiny-rl
- Coleccion "Optimizer" del autor: https://huggingface.co/collections/vanshnawander/optimizer
- Perfil de GitHub del autor: https://github.com/vanshnawander
- Documentacion de variantes de Moonshine (DeepWiki): https://deepwiki.com/moonshine-ai/moonshine/8-model-variants
- Ficha de `sapc2-moonshine-m5g` en free2aitools: https://free2aitools.com/model/vanshnawander/sapc2-moonshine-m5g
