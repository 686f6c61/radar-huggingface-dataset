# SpireLab/Sourashtra_Vits_TTS_Models

## Resumen

Sourashtra VITS TTS Models es una familia de cuatro modelos de sintesis de voz (text-to-speech) desarrollada por SpireLab para el sourashtra (ISO 639-3: `saz`), una lengua indoaria minoritaria hablada principalmente en Tamil Nadu, India. Los modelos se entrenaron con Coqui TTS sobre un corpus de voz anotado de forma personalizada y cubren dos hablantes (masculino y femenino) en dos sistemas de escritura de entrada (tamil y sourashtra).

Cada variante es un modelo VITS de extremo a extremo, con arquitectura flow-based, muestreo a 22050 Hz y 80 bins mel, que trabaja a nivel de caracter (sin fonemas). El repositorio ocupa 4.0 GB e incluye los pesos `best_model.pth`, `config.json`, un script `inference.py` y `requirements.txt` por cada carpeta de modelo.

Su relevancia radica en que el sourashtra es una lengua de bajos recursos con escasa representacion en tecnologia del habla. Estos modelos ofrecen una base funcional y replicable para sintesis en dos ortografias distintas, con licencia CC-BY-4.0 que permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end, flow-based) con Coqui TTS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada de texto de longitud variable) |
| Tipos de cuantizacion | no disponible (pesos en `best_model.pth`, sin versiones GGUF u ONNX publicadas) |
| Idiomas soportados | sourashtra (`saz`), tamil (`ta`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

Los modelos emplean la arquitectura VITS, un sistema de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior condicional y un decoder generativo basado en flujos normalizadores, entrenado de forma adversaria con un discriminador. La configuracion concreta incluye muestreo a 22050 Hz, 80 bins mel, tamano de lote de 16 y entrenamiento con precision mixta. La entrada es a nivel de caracter, sin conversion a fonemas, lo que simplifica el pipeline para una lengua con ortografia poco estandarizada.

Los datos de entrenamiento consisten en un corpus de voz anotado de forma personalizada: aproximadamente 9800-10000 enunciados para los modelos masculinos y unas 11400 para los femeninos. Los modelos masculinos se entrenaron 300000 pasos y los femeninos 340000. No se especifica en la informacion disponible la composicion exacta del dataset, el numero de horas de audio ni si se aplicaron tecnicas de aumento de datos o ajuste fino adicional.

## Capacidades

- Sintesis de voz a partir de texto en sourashtra, con dos sistemas de escritura de entrada: tamil (தமிழ்) y sourashtra (ꢪꢾꢥꢶꢒ).
- Dos voces diferenciadas: masculina y femenina, cada una disponible en ambas ortografias.
- Control de velocidad del habla mediante el parametro `length_scale` en `config.json` (1.43 para la voz masculina y 1.11 para la femenina).
- Normalizacion automatica de texto: los modelos en escritura tamil eliminan `:`, `.`, `'` y aplican NFC; los de escritura sourashtra eliminan el danda simple (꣎) y doble (꣏).
- Inferencia en GPU (seleccionable con `--gpu <id>`) o en CPU (con `--cpu`).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje; es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Accesibilidad y lectura en voz alta para hablantes de sourashtra: el modelo convierte texto en tamil o sourashtra en audio, lo que permite construir lectores de pantalla o herramientas de lectura para una comunidad con pocos recursos digitales en su lengua.
- Preservacion linguistica y archivo sonoro: generar locuciones de referencia en ambas ortografias para materiales educativos, diccionarios o corpus documentales de la lengua.
- Contenido educativo y multimedia: producir narraciones para videos, presentaciones o cursos dirigidos a la comunidad sourashtra, eligiendo voz masculina o femenina segun el publico.
- Interfaces de voz para servicios locales: integrar el modelo en aplicaciones de informacion (horarios, avisos, servicios publicos) que atiendan a hablantes de sourashtra en Tamil Nadu.
- Prototipado de asistentes conversacionales en lenguas minoritarias: usar la salida TTS como componente de un pipeline mayor (ASR + LLM + TTS) para experimentar con asistentes en `saz`.
- Investigacion en TTS de bajos recursos: servir de linea base reproducible con Coqui TTS para comparar tecnicas de sintesis en lenguas indoarias minoritarias con corpus de ~10 000 enunciados.
- Generacion de audiolibros o pódcast en sourashtra: sintetizar textos largos por fragmentos con control de velocidad ajustado mediante `length_scale`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. VITS es un modelo relativamente ligero; el repositorio completo ocupa 4.0 GB, pero cada variante individual es una fraccion de ese tamano. No se especifica el tamano por modelo.
- GPU recomendadas: no se indican modelos concretos. El autor solo menciona soporte de GPU mediante `--gpu <id>` y la necesidad de instalar la build de PyTorch con CUDA acorde al driver.
- Compatibilidad con GPU de consumo: probable en tarjetas con suficiente VRAM para un modelo VITS, pero no se confirma en la informacion disponible.
- Opciones de despliegue: Coqui TTS con el script `inference.py` incluido en cada carpeta. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sourashtra VITS TTS Models | TTS | `saz`, `ta` | VITS (Coqui TTS) | CC-BY-4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de TTS para sourashtra ni de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Cobertura limitada a dos hablantes (uno masculino y uno femenino); no hay variedad de voces ni control de estilo o emocion.
- Entrada a nivel de caracter sin fonemas: la pronunciacion de palabras fuera del corpus o con ortografia irregular puede degradarse.
- Corpus de entrenamiento pequeno (~10 000-11 400 enunciados), lo que aumenta el riesgo de artefactos en textos largos o dominios alejados de los datos de entrenamiento.
- Solo cubre sourashtra y tamil; no es multilingue ni admite mezcla de codigos de forma fiable.
- El ajuste de velocidad depende de editar manualmente `length_scale` en `config.json`; no hay parametro de prosodia expuesto en la interfaz de inferencia.
- Riesgo de alucinacion acustica (ruidos, saltos o repeticiones) inherente a los modelos generativos de voz, especialmente en secuencias largas.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y conservar el aviso de licencia; no se especifican restricciones adicionales.
- No se documentan sesgos de genero o dialectales mas alla de la distincion masculino/femenino; la representatividad del corpus es desconocida.
- Sin benchmarks publicados ni metricas objetivas (MOS, WER) que permitan evaluar la calidad antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpireLab/Sourashtra_Vits_TTS_Models
- Coqui TTS (framework de entrenamiento e inferencia): https://github.com/coqui-ai/TTS
- Idioma sourashtra (Wikipedia): https://en.wikipedia.org/wiki/Sourashtra_language
- PyTorch (instalacion con CUDA): https://pytorch.org/get-started/locally/
