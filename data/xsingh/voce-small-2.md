# xsingh/Voce-small

## Resumen

Voce-small es un modelo de síntesis de voz (text-to-speech) para inglés americano publicado en Hugging Face por el usuario xsingh bajo el identificador `xsingh/Voce-small`. Se trata de una variante de pesos y exportaciones del modelo tiny-voca desarrollado por n4ze3m, un TTS extremadamente compacto entrenado desde cero sobre aproximadamente 18 horas de voz sintética. El repositorio incluye pesos en PyTorch (float32), una exportación ONNX (opset 17) y los ficheros de datos del fonemizador dizione necesarios para convertir texto en fonemas antes de la inferencia.

El modelo completo, incluyendo el generador de forma de onda, suma 4.537.291 parámetros y produce audio mono a 24 kHz. Su rasgo diferencial es la eficiencia: según la model card del autor original, se ejecuta aproximadamente 70 veces más rápido que el tiempo real sobre cuatro hilos de CPU, lo que lo hace apto para despliegues en navegador (onnxruntime-web) y en dispositivos móviles sin acelerador hardware dedicado.

La relevancia actual de este tipo de modelos radica en la demanda de TTS embebido y de baja latencia para interfaces de voz locales, lectores de pantalla, asistentes offline y sistemas con restricciones severas de memoria. Voce-small no compite en naturalidad con modelos neuronales grandes, sino en coste computacional, tamaño de artefacto (21,4 MB en ONNX) y portabilidad del runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS neuronal con fonemizador externo (dizione) y generador de forma de onda; detalles de capas no disponibles |
| Parámetros totales | 4.537.291 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica como contexto de texto; límite de 512 tokens fonéticos y 32 segundos de audio por llamada |
| Tipos de cuantización | no disponible (pesos publicados en float32; sin variantes cuantizadas documentadas) |
| Idiomas soportados | inglés (americano) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`tiny-voca.pt`, float32, 18,2 MB) y ONNX (`onnx/model.onnx`, float32, opset 17, 21,4 MB) |
| Voces | F2 (femenina) y M2 (masculina) |
| Frecuencia de muestreo de salida | 24 kHz, mono |
| Entrada | Texto convertido a fonemas con dizione (ids + marcas de acento) |
| Pesos preentrenados en el modelo | ninguno (entrenado desde cero) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, tipo de encoder, mecanismo de atención ni diseño del generador de forma de onda). Lo que sí se documenta es el flujo completo: el texto se convierte primero en fonemas mediante dizione, un fonemizador externo cuyos ficheros de datos (5,4 MB) se distribuyen junto al modelo; el grafo recibe los ids de fonema, las marcas de acento (0 ninguno, 1 primario, 2 secundario) y parámetros de control (voz, velocidad, desplazamiento de tono y rango de tono), y devuelve directamente la forma de onda a 24 kHz junto con las duraciones por token en tramas de 256 muestras.

El entrenamiento se realizó desde cero sobre aproximadamente 18 horas de habla sintética, sin pesos preentrenados de partida, según la model card. No se especifican en la información proporcionada la composición exacta del dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas de alineamiento o ajuste fino con preferencias humanas (RLHF/DPO). El dataset de referencia es `n4ze3m/tiny-voca`. La innovación técnica destacable es la compacidad extrema del conjunto (menos de 5 millones de parámetros) manteniendo control explícito de prosodia (pitch shift y pitch range) y velocidad, con exportación ONNX que reproduce la salida de PyTorch con una desviación inferior al 0,6 % de la amplitud de pico, salvo la componente de ruido aleatorio que cada runtime genera por su cuenta.

## Capacidades

- Síntesis de voz a partir de texto en inglés americano con dos voces seleccionables (F2 femenina, M2 masculina).
- Control de prosodia en inferencia: velocidad (`speed`), desplazamiento de tono en escala logarítmica de F0 (`pitch_shift`, donde 0,058 equivale aproximadamente a un semitono) y rango de movimiento tonal (`pitch_range`).
- Procesamiento de texto de longitud arbitraria en la herramienta de línea de comandos, que segmenta por frases y une el audio resultante.
- Manejo de texto sin puntuación final: se añade automáticamente un punto; las frases sin contenido legible (por ejemplo, en otro sistema de escritura) se omiten.
- Normalización de pico de salida: el audio guardado nunca supera 0,99 de amplitud.
- Inferencia en CPU pura y en navegador mediante onnxruntime-web (WebAssembly).
- Exportación ONNX con entradas y salidas documentadas para integración en pipelines propios.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un modelo TTS.
- No soporta visión, audio de entrada ni modos de razonamiento.

## Casos de uso

- Lectores de pantalla y accesibilidad en aplicaciones de escritorio: el modelo cabe en 21,4 MB en ONNX y se ejecuta a unas 70 veces el tiempo real en cuatro hilos de CPU, por lo que puede sintetizar texto de interfaz sin depender de servicios en la nube ni de GPU.
- Asistentes de voz embebidos en navegador: la exportación ONNX funciona en onnxruntime-web vía WebAssembly, lo que permite generar respuestas habladas en el cliente con dos voces y control de velocidad, sin enviar texto del usuario a un servidor.
- Aplicaciones móviles offline: con menos de 5 millones de parámetros y pesos en float32 de 18,2 MB, el modelo es viable en dispositivos con memoria limitada para avisos, navegación por menús o lectura de notificaciones.
- Generación de avisos y locuciones dinámicas en sistemas de megafonía o kioscos: la CLI acepta texto desde fichero (`--text-file`) y segmenta por frases, lo que facilita la producción por lotes de anuncios con velocidad y tono ajustables.
- Prototipado rápido de interfaces conversacionales: al ser Apache-2.0 y ejecutarse en CPU, permite iterar sobre flujos de voz en entornos de desarrollo sin aprovisionar GPU ni contratar APIs de terceros.
- Pruebas de regresión y evaluación de pipelines TTS: la salida determinista salvo el ruido aleatorio y la correspondencia documentada entre PyTorch y ONNX (desviación menor del 0,6 % del pico) permiten comparar implementaciones y detectar divergencias entre runtimes.
- Doctesting o narración de documentación técnica en inglés: la CLI procesa texto de cualquier longitud frase a frase, adecuada para convertir manuales o ficheros de texto en audio con una voz consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento proporcionado por el autor es la velocidad de inferencia: aproximadamente 70 veces el tiempo real sobre cuatro hilos de CPU, sin especificar el hardware concreto ni el tamaño de las frases medidas. No hay cifras de MOS, WER de síntesis, ni comparaciones numéricas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso CPU; en GPU, el modelo en float32 ocupa 18,2 MB en PyTorch y 21,4 MB en ONNX, por lo que la huella de memoria es despreciable frente a cualquier acelerador moderno.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de PyTorch u ONNX Runtime es sobrada. El modelo está diseñado para CPU.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo, e incluso sin GPU. El escenario objetivo es CPU y navegador.
- Opciones de despliegue: PyTorch (paquete `tiny-voca` instalable desde el repositorio de GitHub), ONNX Runtime en Python, onnxruntime-web (WebAssembly) en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: aproximadamente 70 veces más rápido que el tiempo real en cuatro hilos de CPU, según el autor. No se proporcionan cifras de latencia por frase ni de throughput en otras configuraciones.
- Límites operativos: máximo de 512 tokens fonéticos y 32 segundos de audio por llamada; el texto más largo debe dividirse en frases.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos que permitan una comparación cuantitativa rigurosa. La siguiente tabla recoge únicamente los atributos documentados de Voce-small y deja constancia de la ausencia de datos comparables.

| Atributo | Voce-small (tiny-voca) | Alternativas de la misma categoría |
|---|---|---|
| Parámetros | 4.537.291 | no disponible |
| Idiomas | inglés americano | no disponible |
| Voces | 2 (F2, M2) | no disponible |
| Formato de pesos | PyTorch, ONNX | no disponible |
| Licencia | Apache-2.0 | no disponible |
| Ejecución en CPU | sí, ~70x tiempo real en 4 hilos | no disponible |
| Rendimiento comparado (MOS, WER) | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura lingüística restringida al inglés americano; el texto en otros sistemas de escritura se omite y no se sintetiza.
- Solo dos voces pregrabadas (F2 y M2); no hay clonación de voz ni hablantes arbitrarios.
- El modelo puede producir picos de amplitud superiores a 1,0 en aproximadamente una de cada veinte frases, por lo que es obligatorio reescalar la salida antes de guardar muestras de 16 bits.
- Las frases sin signo de puntuación final provocan que la última palabra se corte; es necesario terminar cada enunciado con un signo.
- Límite duro de 512 tokens fonéticos y 32 segundos por llamada; textos más largos requieren segmentación externa.
- Al estar entrenado sobre habla sintética, la naturalidad y la prosodia pueden ser inferiores a las de modelos entrenados con voz humana, aunque la información disponible no cuantifica esta diferencia.
- Riesgo de alucinación en el sentido de prosodia o pronunciación incorrecta de palabras fuera del vocabulario fonético cubierto; no se documentan evaluaciones de inteligibilidad.
- No se documentan sesgos demográficos ni acústicos específicos, pero la información disponible no incluye análisis de sesgo.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales de uso aceptable más allá de las de la propia licencia.
- El repositorio `xsingh/Voce-small` registra 0 descargas y 0 likes en el momento de la consulta, y su fecha de creación es posterior a la del modelo original de n4ze3m; conviene verificar la procedencia y la integridad de los pesos mediante los hashes SHA256 publicados antes de usarlo en producción.
- El modelo es exclusivamente TTS: no procesa audio de entrada, no transcribe y no ofrece capacidades de razonamiento ni de agente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xsingh/Voce-small
- Modelo original en Hugging Face: https://huggingface.co/n4ze3m/tiny-voca
- Código: https://github.com/n4ze3m/tiny-voca
- Fonemizador dizione: https://github.com/n4ze3m/dizione
- Dataset: https://huggingface.co/datasets/n4ze3m/tiny-voca
- Demo en navegador: https://huggingface.co/spaces/n4ze3m/tiny-voca-studio
