# withlike/htdemucs-6s-onnx

## Resumen

`htdemucs-6s-onnx` es una conversión al formato ONNX del modelo Demucs en su variante `htdemucs_6s`, un sistema de separación de fuentes musicales desarrollado originalmente por Meta Research (antiguo Facebook AI Research). El modelo original divide una mezcla de audio en seis pistas o "stems": batería, bajo, otros, voz, guitarra y piano. Esta versión, publicada por el usuario `withlike`, empaqueta los pesos en un único artefacto ONNX de aproximadamente 0,3 GB, lo que facilita su despliegue en entornos de inferencia que no disponen de PyTorch nativo, como aplicaciones web, móviles o servicios en C#/.NET y JavaScript.

La relevancia de esta ficha radica en que el modelo original es una referencia consolidada en separación de fuentes musicales, y su exportación a ONNX amplía el abanico de plataformas donde puede ejecutarse. No obstante, la model card es extremadamente escueta: no documenta parámetros, contexto (no aplica, es un modelo de audio), ni detalles de entrenamiento, por lo que buena parte de las especificaciones se marcan como "no disponible".

Se trata, por tanto, de un artefacto de conversión más que de un modelo nuevo. Su valor está en la portabilidad, no en mejoras de calidad respecto al `htdemucs_6s` original de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo original: red híbrida transformer-convolucional para audio, Demucs v4) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; ventana de procesamiento no documentada) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo subyacente, `htdemucs_6s`, pertenece a la familia Demucs v4 de Meta Research. Se trata de una arquitectura híbrida que combina capas convolucionales con mecanismos de atención tipo transformer para procesar la señal de audio en el dominio de la forma de onda o espectrograma. La variante `6s` amplía la separación clásica de cuatro stems (batería, bajo, otros, voz) a seis, añadiendo guitarra y piano.

Esta ficha corresponde exclusivamente a la conversión ONNX publicada por `withlike`, que referencia los pesos originales de Meta Research y una conversión previa de StemSplitio. La model card no aporta información sobre el conjunto de entrenamiento, el número de horas de audio, ni sobre técnicas de aumento de datos o ajuste fino. Tampoco se documenta si la conversión introduce alguna pérdida de precisión numérica respecto a los pesos originales en PyTorch. Todos estos datos se marcan como no disponibles.

## Capacidades

- Separación de fuentes musicales en seis stems: batería, bajo, otros, voz, guitarra y piano.
- Procesamiento de audio de entrada en formato de mezcla musical (wav, mp3 u otros, según el preprocesado externo).
- Ejecución en entornos con runtime ONNX (ONNX Runtime, TensorRT, etc.), sin dependencia de PyTorch.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión ni audio de entrada como texto; es un modelo puramente de separación de audio.

## Casos de uso

- **Producción musical y remezclas**: extraer las seis pistas de una canción para editar, remezclar o remasterizar por separado. La separación en guitarra y piano (frente a los cuatro stems clásicos) es especialmente útil en géneros como rock o clásica.
- **Karaoke automático**: aislar la pista de voz y generar versiones instrumentales. La ventana de contexto no aplica, pero el modelo procesa la mezcla completa y devuelve stems alineados.
- **Despliegue en aplicaciones .NET o web**: al estar en ONNX, puede integrarse en servicios C#, JavaScript (ONNX Runtime Web) o aplicaciones de escritorio sin instalar PyTorch, reduciendo el tamaño del binario y las dependencias.
- **Procesamiento por lotes en servidores sin GPU NVIDIA**: ONNX Runtime permite ejecución en CPU con optimizaciones (p. ej., OpenVINO, DirectML), lo que facilita su uso en infraestructura heterogénea.
- **Investigación en separación de fuentes**: servir como baseline reproducible en formato ONNX para comparar con otros modelos o para experimentar con cuantización y optimización de grafos.
- **Herramientas de accesibilidad y educación musical**: aislar instrumentos concretos para practicar o estudiar una pieza, integrado en apps de escritorio o web que no quieran depender de un stack de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como SDR (Signal-to-Distortion Ratio), SI-SNR ni comparaciones con el modelo original en PyTorch. Tampoco se documenta la latencia ni el throughput de la versión ONNX.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repositorio es de 0,3 GB, lo que sugiere que los pesos ocupan aproximadamente esa cifra; la VRAM necesaria para inferencia dependerá del tamaño de la ventana de audio y del runtime.
- **GPU recomendadas**: no disponibles en la documentación. Al ser un modelo de audio de tamaño moderado, es probable que quepa en GPUs consumer, pero no hay datos oficiales.
- **¿Cabe en GPU consumer?**: probablemente sí, dado el tamaño del artefacto (0,3 GB), pero no está confirmado.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU), TensorRT, ONNX Runtime Web, DirectML, OpenVINO. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Stems | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `htdemucs-6s-onnx` (esta ficha) | no disponible | 6 | ONNX | MIT | HuggingFace |
| `htdemucs_6s` (Meta Research) | no disponible | 6 | PyTorch | MIT | Repositorio oficial de Demucs |
| `htdemucs` (Demucs v4, 4 stems) | no disponible | 4 | PyTorch | MIT | Repositorio oficial de Demucs |
| Spleeter (Deezer) | no disponible | 2/4/5 | TensorFlow | MIT | GitHub |

La comparativa se limita a la disponibilidad de formatos y número de stems, ya que no se han publicado métricas de calidad en la información proporcionada.

## Limitaciones y advertencias

- **Falta de documentación**: la model card no detalla parámetros, entrenamiento ni métricas, lo que dificulta evaluar su calidad frente al original.
- **Riesgo de artefactos**: como toda separación de fuentes, puede producir artefactos o "sangrado" entre stems, especialmente en mezclas densas o con instrumentos poco representados.
- **Conversión no verificada**: no se documenta si la exportación a ONNX introduce pérdida de precisión (p. ej., fp16 vs fp32) ni si se han validado los resultados frente a PyTorch.
- **Sin soporte de texto ni multilingüe**: no es un modelo de lenguaje; no debe usarse para tareas de NLP.
- **Licencia MIT**: permite uso comercial, pero conviene verificar la licencia del modelo original de Meta Research (también MIT en Demucs) y respetar la atribución.
- **Caveat de producción**: al tener 0 descargas y 0 likes, no hay evidencia de uso en producción ni de validación por la comunidad; se recomienda probar exhaustivamente antes de desplegarlo.

## Enlaces

- [HuggingFace: withlike/htdemucs-6s-onnx](https://huggingface.co/withlike/htdemucs-6s-onnx)
- Repositorio oficial de Demucs (Meta Research): no disponible en la información proporcionada
- Conversión de referencia StemSplitio: no disponible en la información proporcionada
- Paper de Demucs v4 (Hybrid Transformer Demucs): no disponible en la información proporcionada
