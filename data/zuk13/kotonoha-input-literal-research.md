# Zuk13/kotonoha-input-literal-research

## Resumen

Kotonoha-input-literal-research es un paquete de recursos de investigación publicado por Zuk13 para un motor de conversión kana-kanji (entrada de texto japonés, IME) orientado a CPU de Windows. No es un modelo único entrenado de cero, sino una composición de artefactos: un conversor común de 24,20 M de parámetros, pesos derivados de `rinna/japanese-gpt2-xsmall` y `rinna/japanese-gpt2-small`, un GGUF derivado de `iroha-t5-alpha` y tablas de frecuencias de n-gramas de caracteres. El objetivo es mejorar la conversión de frases mixtas (con caracteres alfanuméricos y símbolos) y la reconversión explícita antes de confirmar la entrada.

El repositorio distingue dos configuraciones: `literal_rapid`, pensada para revisar mientras se escribe, y `literal_gen`, pensada para reconvertir una frase completa antes de fijarla. El modelo base declarado suma 113.959.680 parámetros en safetensors y el repositorio ocupa 0,3 GB. La licencia es `other` bajo el nombre `kotonoha-component-licenses`, con condiciones por componente que se detallan en `LICENSE-SCOPE.md`.

Su relevancia es acotada pero específica: documenta con métricas propias (Top-1, latencia p95, memoria) el comportamiento de un IME japonés basado en modelos pequeños cuantizados que corre en CPU, un nicho poco cubierto por los modelos generativos generalistas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Composición híbrida: conversor propio de 24,20 M; ONNX derivado de GPT-2 (6 capas en `literal_rapid`, 12 capas en `literal_gen`); GGUF encoder-decoder derivado de T5 (encoder 12 capas, decoder 2 capas); tablas de n-gramas de caracteres (1 a 5) |
| Parámetros totales | 113.959.680 (safetensors del repo); el conversor común aporta 24,20 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa lectura más contexto izquierdo por segmentos, sin ventana publicada) |
| Tipos de cuantización | ONNX cuantizado (detalle no especificado); GGUF Q5_K_M (re-cuantizado desde Q8_0 del upstream) |
| Idiomas soportados | japonés (ja) |
| Licencia | `other`, nombre `kotonoha-component-licenses`; el componente GGUF derivado de iroha-t5-alpha queda bajo CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX, GGUF, NPY/NPZ (tablas de frecuencias y coeficientes de ranking) |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico. Combina un conversor propio de 24,20 M de parámetros (diccionario, generación de candidatos y selección de ranking) con dos rutas neuronales: un ONNX convertido desde `rinna/japanese-gpt2-xsmall` con caché de prefijo común de 6 capas y cuantización, y un ONNX convertido desde `rinna/japanese-gpt2-small` que usa 12 capas con embeddings cuantizados por filas y normalización sobre todo el vocabulario para puntuar candidatos existentes y generados. La generación libre se apoya en un GGUF derivado de `iroha-t5-alpha`, con encoder de 12 capas y decoder de 2, y una comprobación de lectura sobre las candidaturas.

El flujo de conversión segmenta las secuencias de kana delimitadas por caracteres ya introducidos y propaga el contexto izquierdo confirmado junto con la primera candidata del segmento anterior al siguiente. El autor indica explícitamente que no se ha entrenado un modelo completo desde cero: se reutilizan pesos de rinna, un vocabulario SentencePiece idéntico byte a byte entre ambos modelos y recursos comunes publicados con revisión fijada. No se documentan número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Conversión kana-kanji con contexto izquierdo, devolviendo candidatos ordenados.
- Conversión de frases mixtas con caracteres alfanuméricos y símbolos, preservando las entradas explícitas (`literal_rapid`).
- Reconversión explícita de una frase completa antes de confirmarla (`literal_gen`).
- Puntuación de candidatos existentes y generados mediante normalización sobre todo el vocabulario.
- Generación libre de candidatos con verificación de lectura sobre la salida del componente T5.
- Ejecución en CPU de Windows con hilos de operación configurables.
- Integración prevista en una aplicación Android de prueba (no validada en dispositivo real según el autor).
- No se documentan tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- IME de escritorio en Windows: el modelo convierte lecturas kana a kanji en tiempo real sobre CPU, con latencia mediana de 18,5 ms en `literal_rapid` y p95 de 159,8 ms en un Core i5-4590, adecuado para entrada interactiva sin GPU.
- Revisión de texto mixto con números y símbolos: `literal_rapid` preserva 336/336 entradas explícitas en la evaluación del autor, útil en campos donde direcciones, códigos o unidades no deben convertirse a kanji.
- Reconversión antes de confirmar: `literal_gen` ofrece la mejor tasa de acierto Top-1 en frases de película con contexto izquierdo (358/530), apropiado para un botón de "reconvertir frase" en editores.
- Corrección de homófonos registrados: con 120/164 aciertos en pares de homófonos en `literal_gen`, sirve como capa de desambiguación en dominios con vocabulario controlado.
- Investigación en IME neuronal de bajo consumo: el paquete incluye métricas de memoria (353,8 a 556,2 MiB según configuración), lo que permite reproducir experimentos en hardware modesto.
- Prototipado de teclados Android: el autor publica un APK de pre-release para probar la integración, aunque advierte que no ha medido precisión, velocidad ni PSS en dispositivo.
- Evaluación comparativa de estrategias de conversión: las cuatro configuraciones fijas (compiledmix, mixdispatch, literal_rapid, literal_gen) permiten contrastar compromisos entre latencia y calidad.

## Benchmarks y rendimiento

| Métrica | compiledmix | mixdispatch | literal_rapid | literal_gen |
|---|---:|---:|---:|---:|
| Top-1 en frases de película con contexto izquierdo | 312/530 | 316/530 | 338/530 | 358/530 |
| Coincidencia exacta desde entrada íntegra en kana | 146/194 | 147/194 | 134/194 | 143/194 |
| Preservación de entradas alfanuméricas y símbolos | 330/336 | 330/336 | 336/336 | 336/336 |
| Pares de homófonos registrados correctos en ambos lados | 104/164 | 104/164 | 110/164 | 120/164 |
| Conservación de kana (registro / material) | 553/617 · 271/309 | 554/617 · 271/309 | 539/617 · 263/309 | 543/617 · 266/309 |
| Top-1 admisible AJIMEE / HardBench oficial | 118/200 · 221/400 | 120/200 · 203/400 | 138/200 · 191/400 | 157/200 · 230/400 |
| Conversión directa mediana / p95 (ms) | 27,2 / 146,7 | 41,6 / 178,4 | 18,5 / 159,8 | 41,7 / 407,3 |
| p95 hasta la candidata final tras fin de entrada (ms) | 27,7 | 262,1 | 4,3 | 460,0 |
| Recursos necesarios (MiB) | 369,3 | 353,8 | 427,6 | 556,2 |

Mediciones en Windows sobre Core i5-4590, con los hilos de operación de cada configuración y sin competencia con el cálculo de calidad. Conversión directa: 20 entradas, 2 repeticiones. Entrada continua: 12 tipos con pulsaciones variables centradas en 85 ms, 2 repeticiones en orden invertido. Con exigencia de confirmación a 100 ms, los aciertos fueron 14/24 (compiledmix), 18/24 (literal_rapid) y 10/24 (literal_gen). El autor advierte que la selección se hizo con conjuntos reutilizados y que el efecto sobre entradas desconocidas no está determinado.

## Requisitos de hardware

- Inferencia en CPU x86 de escritorio; la referencia medida es un Intel Core i5-4590 en Windows.
- Memoria de trabajo del sistema: entre 353,8 y 556,2 MiB para modelos, diccionarios y recursos, según configuración.
- No se documenta uso de VRAM ni aceleración por GPU; el diseño apunta a CPU.
- No se especifican GPU recomendadas ni compatibilidad con A100, H100 o RTX 4090.
- Despliegue mediante ONNX Runtime y llama.cpp/GGUF; no se mencionan vLLM, TGI ni Ollama.
- Latencia: mediana de 18,5 a 41,7 ms y p95 de 146,7 a 407,3 ms en conversión directa; el throughput no se publica.
- El paquete completo requiere 188 recursos comunes, de los cuales 55 están retenidos y no se redistribuyen; sin ellos no se logra la conversión completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kotonoha-input-literal-research | 113,96 M (conversor 24,20 M) | no disponible | IME kana-kanji en CPU | `kotonoha-component-licenses` (componente GGUF CC BY-SA 4.0) | Hugging Face, repo de 0,3 GB, subconjunto incompleto |
| rinna/japanese-gpt2-small | no disponible en la información | no disponible | LM japonés GPT-2 | no disponible en la información | Hugging Face |
| rinna/japanese-gpt2-xsmall | no disponible en la información | no disponible | LM japonés GPT-2 | no disponible en la información | Hugging Face |
| iroha-t5-alpha (Tetsuaki Baba) | no disponible en la información | no disponible | T5 japonés | CC BY-SA 4.0 | Hugging Face |

No se dispone de datos comparativos de rendimiento frente a otros IME neuronales en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado desde cero: es una composición de derivados con revisiones fijadas; su comportamiento depende de los pesos de rinna y del GGUF de terceros.
- La conservación de kana queda por debajo de la condición previa: 539/617 y 263/309 en `literal_rapid`, frente a 553/617 y 271/309 de referencia.
- La coincidencia exacta desde entrada íntegra en kana baja en las configuraciones nuevas (134/194 y 143/194) frente a las previas (146/194 y 147/194).
- La preservación de entradas explícitas no garantiza la corrección global de la frase convertida.
- La selección de configuraciones usó conjuntos reutilizados; el efecto sobre entradas desconocidas no está confirmado.
- El autor no ha verificado instalación, carga de modelos, inferencia ni respuesta de la UI en Android; precisión, velocidad y PSS en dispositivo están sin medir.
- El paquete público está incompleto: 55 de 188 recursos comunes no se redistribuyen y se requiere posesión legítima para la conversión completa.
- La licencia es por componente; el uso comercial exige revisar `LICENSE-SCOPE.md` y respetar CC BY-SA 4.0 en el derivado T5.
- Solo soporta japonés; no hay datos de sesgos, alucinación en texto libre ni robustez fuera del dominio evaluado.
- No se incluyen en el repo las tablas de predicción antiguas, los textos de entrenamiento, las actas de evaluación ni el APK.

## Enlaces

- [Hugging Face: Zuk13/kotonoha-input-literal-research](https://huggingface.co/Zuk13/kotonoha-input-literal-research)
- [LICENSE-SCOPE.md](https://huggingface.co/Zuk13/kotonoha-input-literal-research/blob/main/LICENSE-SCOPE.md)
- [assets.json](https://huggingface.co/Zuk13/kotonoha-input-literal-research/blob/main/assets.json)
- [REPRODUCE.md](https://huggingface.co/Zuk13/kotonoha-input-literal-research/blob/main/REPRODUCE.md)
- [GitHub: Zuk13/kotonoha-input](https://github.com/Zuk13/kotonoha-input)
- [GitHub research pre-release y APK](https://github.com/Zuk13/kotonoha-input/releases/tag/research-literal-20261124)
- [Código e informe fijados por etiqueta](https://github.com/Zuk13/kotonoha-input/tree/research-literal-20261124/research/literal-20261124)
- [rinna/japanese-gpt2-small](https://huggingface.co/rinna/japanese-gpt2-small)
- [rinna/japanese-gpt2-xsmall](https://huggingface.co/rinna/japanese-gpt2-xsmall)
