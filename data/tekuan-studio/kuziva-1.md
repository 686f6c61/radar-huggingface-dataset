# tekuan-studio/kuziva-1

## Resumen

Kuziva 1 es un modelo de lenguaje conversacional de 29,5 millones de parámetros entrenado desde cero por el autor Kuna en T.E.K.U.A.N Studio (Zimbabue) como proyecto de aprendizaje. Se distribuye bajo licencia MIT y está diseñado para ejecutarse completamente offline en la CPU de un portátil, sin dependencia de servicios en la nube. Su rasgo más distintivo no es la capacidad generativa, sino el mecanismo de "notas": el modelo no almacena conocimiento factual propio y copia hechos desde un fichero `notes.txt` que el usuario proporciona, con un emparejamiento difuso por temas.

La arquitectura es un transformer decoder-only de tamaño muy reducido (512 dimensiones de modelo, 8 capas, 8 cabezas de atención) con una ventana de contexto de solo 256 tokens. Emplea un tokenizador BPE con vocabulario de 8.192 tokens y tokens especiales para turnos de usuario y bot. El entrenamiento se realizó en una GPU T4 de Google Colab con aproximadamente 342 millones de tokens procedentes de SODA (diálogos públicos) y FineWeb-Edu (texto educativo web), seguido de un ajuste fino con unos 25.000 ejemplos de chat escritos y revisados por el autor.

Su relevancia es fundamentalmente educativa y de investigación: demuestra el ciclo completo de entrenamiento desde cero (tokenizador, preentrenamiento, ajuste fino, interfaz web y de terminal) con recursos mínimos. No es un modelo competitivo frente a alternativas de su tamaño en tareas de razonamiento o generación abierta, y el propio autor documenta sus limitaciones con honestidad, incluida la incapacidad de decir "no lo sé" de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (512 de dimensión, 8 capas, 8 cabezas) |
| Parametros totales | 29,5 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos distribuidos en fp32, ~118 MB) |
| Idiomas soportados | Inglés (shona no cubierto de forma fiable) |
| Licencia | MIT para el código; los pesos dependen de las licencias de los datasets de entrenamiento |
| Formato de pesos | PyTorch (`.pt`), tokenizador en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de escala muy pequeña: 512 dimensiones de modelo, 8 capas y 8 cabezas de atención, con una longitud de contexto de 256 tokens. El tokenizador es BPE con un vocabulario de 8.192 tokens (las primeras ejecuciones usaron 4.096) e incluye los tokens especiales `<pad>`, `<start>`, `<end>`, `<user>` y `<bot>` para estructurar los turnos de conversación.

El preentrenamiento consumió aproximadamente 342 millones de tokens procedentes de SODA (diálogos públicos) y FineWeb-Edu (texto educativo web). Posteriormente se aplicó un ajuste fino con unos 25.000 ejemplos de chat escritos y verificados por el autor, complementados con diálogos públicos de EmpatheticDialogues y SODA, además de ejemplos de notas con el formato `<bos> info: fact <user> question <bot> answer <eos>`. El entrenamiento se realizó en una GPU T4 de Google Colab y la inferencia está pensada para CPU de portátil. No se documenta el uso de RLHF ni DPO.

La innovación principal no es arquitectónica sino de diseño: el modelo delega el conocimiento factual en un fichero externo de notas (`topic one; topic two | fact`), que se inyecta en el contexto solo cuando la pregunta coincide con un tema en al menos un 70 % mediante emparejamiento difuso (librería `rapidfuzz` en el servidor web; coincidencia simple de palabras en el script de terminal). Esto reduce la necesidad de conocimiento parametrizado a costa de depender de la calidad y cobertura del fichero de notas.

## Capacidades

- Generación de texto conversacional breve en inglés sencillo.
- Copia de hechos desde un fichero `notes.txt` externo proporcionado por el usuario.
- Consulta de la hora y la fecha del reloj del sistema.
- Interfaz de chat web local (`server.py` + `kuziva_ui.html`) con modo claro y oscuro, historial de conversación y voz opcional mediante Piper.
- Script de chat de terminal offline (`kuziva_chat.py`).
- Respuesta "I don't know" en algunos casos, aunque de forma no fiable.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No realiza razonamiento matemático ni redacción de textos largos.
- Capacidad multilingüe muy limitada: el shona no está cubierto de forma fiable.

## Casos de uso

- Demostración educativa de entrenamiento desde cero: sirve para ilustrar el pipeline completo (tokenizador BPE, preentrenamiento, ajuste fino, despliegue local) en cursos y talleres con recursos mínimos, ya que entrena en una T4 y se ejecuta en CPU.
- Asistente de consulta de notas locales en un portátil sin conexión: el modelo responde a preguntas sobre un conjunto acotado de hechos (horarios, definiciones, datos internos de un negocio) siempre que se redacten como temas en `notes.txt`, con emparejamiento difuso al 70 %.
- Prototipado de interfaces conversacionales: la UI web de un solo fichero con historial y voz permite validar flujos de chat y diseño de interacción sin coste de API ni infraestructura.
- Pruebas de robustez y alucinación en modelos pequeños: sus fallos documentados (repetición de palabras, respuestas de persona inestables, invención de hechos sin nota) lo convierten en un banco de pruebas para estudiar comportamiento de modelos de baja escala.
- Experimentos de recuperación aumentada ligera: el mecanismo de notas con emparejamiento difuso es una aproximación mínima a RAG que puede usarse para enseñar conceptos de recuperación de contexto en entornos sin GPU.
- Base para investigación en lenguas de bajos recursos: el autor señala que los datos de shona son aún insuficientes; el modelo sirve como punto de partida para experimentar con ampliación de vocabulario y datasets en lenguas africanas.
- Despliegue en entornos air-gapped: al no requerir red, puede integrarse en máquinas aisladas para tareas de consulta de notas internas, siempre con revisión humana de las respuestas.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Pérdida de validación en preentrenamiento | 2,49 |
| Pérdida de validación tras ajuste fino | 2,70–2,88 (según la ejecución) |
| Test de copia de hecho inventado | 15 de 16 copiados correctamente desde una nota |
| Test de nota incorrecta | 0 de 8 correctos |
| Test sin nota | 0 de 8 correctos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario previsto; el modelo corre en CPU. Los pesos en fp32 ocupan aproximadamente 118 MB.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una Google Colab T4. Para inferencia no se requiere GPU.
- Cabe en cualquier GPU consumer e incluso en CPU de portátil; el repositorio completo ocupa 0,1 GB.
- Opciones de despliegue: scripts propios en PyTorch (`kuziva_chat.py` para terminal, `server.py` para navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` no es directamente compatible con esos motores sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kuziva 1 | 29,5 M | 256 | Chat con notas externas, offline en CPU | MIT (código); pesos sujetos a licencias de datasets | HuggingFace (tekuan-studio/kuziva-1) |
| Modelos comparables de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de escala similar en la documentación proporcionada.

## Limitaciones y advertencias

- Alucina en preguntas sin nota asociada; el propio autor documenta que no dice "no lo sé" de forma fiable (0 de 8 en los tests sin nota y con nota incorrecta).
- Repite palabras en algunas respuestas basadas en notas.
- Las respuestas de persona son inestables (por ejemplo, nombres).
- No razona, no hace matemáticas ni redacta ensayos.
- El shona no está cubierto de forma fiable por falta de datos.
- Contexto muy limitado (256 tokens): los hechos de las notas deben mantenerse por debajo de unas 35 palabras.
- No ha sido evaluado en seguridad; no debe usarse para consejo médico, legal o financiero.
- Algunas respuestas pueden resultar oscuras o incorrectas; requiere revisión humana antes de mostrarlas a terceros.
- Licencia MIT para el código, pero los pesos se entrenaron con datasets públicos (SODA, FineWeb-Edu, EmpatheticDialogues) que pueden imponer términos adicionales; verificar cada licencia antes de un uso comercial.
- No publicar mensajes personales o de terceros en los datos de ajuste o en las notas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tekuan-studio/kuziva-1
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SODA: https://huggingface.co/datasets/allenai/soda
- Piper (síntesis de voz opcional): https://github.com/rhasspy/piper
- Voces de Piper: https://huggingface.co/rhasspy/piper-voices
