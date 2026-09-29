# vers-project/vocal-intensity-conversion

## Resumen

Vocal intensity conversion es un modelo de conversión de audio a audio desarrollado por vers-project (Quentin Le Tellier, Albert Rilliard, Olivier Perrotin y Marc Evrard) que reescribe una grabación de voz a una intensidad vocal objetivo expresada en dB SPL a 1 metro, preservando el contenido lingüístico y la identidad del hablante. No es un modelo generativo de texto ni un sistema de texto a voz: actúa como un convertidor que transforma las representaciones internas de un codificador de habla congelado y deja que un vocoder preentrenado resintetice la señal.

El componente entrenado es un Transformer encoder de seis capas, anchura 128 y cuatro cabezas, con 2,66 millones de parámetros. Se apoya en WavLM-Large (capa 6) como codificador de características y en el vocoder HiFi-GAN de kNN-VC para la resíntesis; ninguno de los dos se distribuye en el repositorio, sino que se descargan desde sus fuentes originales (unos 1,3 GB en la primera ejecución). El entrenamiento se realizó como una GAN condicional con consistencia de ciclo (cycle-consistent) y sin datos paralelos, sobre el split de entrenamiento de AVID (Aalto Vocal Intensity Database).

Su relevancia es fundamentalmente de investigación: ofrece control continuo y calibrado de la intensidad vocal, una variable prosódica que la mayoría de los sistemas de conversión de voz tratan de forma categórica o ignoran. El trabajo está enviado a ICASSP 2027 y la licencia es MIT, pero el repositorio se publicó sin resultados de benchmarks y con un tamaño reportado de 0,0 GB en HuggingFace, por lo que debe verificarse el contenido real antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 6 capas (anchura 128, 4 cabezas) como convertidor sobre features de WavLM-Large capa 6; vocoder HiFi-GAN de kNN-VC para resintesis |
| Parametros totales | 2,66 M (solo el convertidor; WavLM-Large y el vocoder se descargan aparte) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `model.safetensors`; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (el modelo no recibe identificador de idioma; se entrena unicamente con AVID) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.yaml` por carpeta de modelo |

## Arquitectura y entrenamiento

El sistema es un pipeline de tres etapas. Primero, un codificador de habla congelado (WavLM-Large) extrae representaciones de la locución de entrada; el convertidor consume la capa 6. Segundo, el convertidor, un Transformer encoder de seis capas con anchura 128 y cuatro cabezas (2,66 M de parámetros), transforma esas representaciones hacia la intensidad vocal objetivo, expresada como un valor continuo en dB SPL a 1 m. Tercero, el vocoder HiFi-GAN procedente de kNN-VC resintetiza la forma de onda a partir de las features convertidas. Solo se entrena el bloque intermedio: el codificador y el vocoder permanecen congelados.

El entrenamiento se planteó como una GAN condicional con consistencia de ciclo y sin datos paralelos, sobre el split de entrenamiento de AVID (Aalto Vocal Intensity Database, CC BY 4.0), durante 11 400 iteraciones. Al no requerir pares de la misma frase a distintas intensidades, el modelo aprende la transformación de intensidad sin necesidad de un corpus alineado. No se documenta en la información disponible el uso de RLHF, DPO ni de decodificación especulativa, y tampoco se detalla la composición exacta del dataset más allá de su procedencia.

## Capacidades

- Conversión audio a audio con control continuo de la intensidad vocal objetivo, especificada en dB SPL a 1 m.
- Preservación del contenido lingüístico y de la identidad del hablante, según declara el autor del modelo.
- Rango de intensidad validado de 42,8 a 76,1 dB SPL (el visto durante el entrenamiento).
- Funcionamiento sin datos paralelos gracias al esquema de entrenamiento adversarial con consistencia de ciclo.
- Ejecución en CPU o GPU mediante el script `scripts/convert.py` del repositorio oficial.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No procesa texto, imagen ni vídeo; su única modalidad es audio a audio.
- Capacidades multilingües: no disponibles; el modelo no está condicionado por idioma, pero solo se ha entrenado con AVID.

## Casos de uso

- Post-producción de doblaje y locución: igualar la intensidad vocal de varias tomas grabadas en sesiones distintas a un SPL objetivo común (por ejemplo, 65 dB SPL a 1 m) sin rehacer la interpretación, ya que el convertidor preserva contenido e identidad del hablante.
- Normalización de corpus para investigación en prosodia y fonética: generar versiones de un mismo enunciado a intensidades controladas y comparables, algo que con grabaciones naturales exige repetir la locución y no garantiza una calibración precisa.
- Aumento de datos para ASR: producir variantes de intensidad de un corpus de entrenamiento para que un sistema de reconocimiento de voz sea robusto a cambios de nivel, manteniendo la transcripción intacta.
- Estimulación en experimentos de percepción del habla: construir estímulos con SPL exacto y conocido para estudiar el efecto de la intensidad en la inteligibilidad o en juicios de personalidad del hablante.
- Restauración de archivos sonoros: elevar la intensidad de grabaciones históricas o de campo de nivel bajo hacia un rango más audible, conservando la voz original en lugar de aplicar una ganancia uniforme que amplifica también el ruido de fondo.
- Prototipos de accesibilidad auditiva: adaptar la intensidad de una grabación a las necesidades de una persona con pérdida auditiva o para escucha en entornos ruidosos, ajustando el objetivo en dB mediante el parámetro `--target-db`.
- Preprocesado de salidas de sistemas TTS: homogeneizar el nivel de locuciones sintéticas antes de integrarlas en un pipeline de audio, siempre que la señal de entrada sea una forma de onda ya generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye métricas, y el artículo asociado está únicamente enviado a ICASSP 2027, sin resultados accesibles en el momento de redactar esta ficha. No se dispone por tanto de cifras de error de intensidad (dB), MOS, similitud de hablante ni inteligibilidad.

## Requisitos de hardware

- Convertidor: 2,66 M de parámetros, aproximadamente 10 MB en fp32.
- Componentes descargados aparte: WavLM-Large y el vocoder HiFi-GAN de kNN-VC, en conjunto alrededor de 1,3 GB, que se guardan en `~/.cache/vic` en la primera ejecución.
- VRAM estimada: no disponible de forma oficial. Como estimación orientativa basada en el tamaño de los componentes (aproximadamente 350 M de parámetros en total), la inferencia debería caber en GPUs de consumo con 4 GB o más, e incluso ejecutarse en CPU; esta cifra no está confirmada por el autor.
- GPU recomendadas: no hay ninguna recomendación publicada. El repositorio ofrece explícitamente un extra de CPU (`uv run --extra cpu --extra hub`), lo que indica que la inferencia en CPU es un escenario soportado.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido, pero sin confirmación oficial.
- Opciones de despliegue: script propio `scripts/convert.py` sobre Python con `uv`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación directa no está disponible: los sistemas de conversión de voz más extendidos (RVC, so-vits-svc, Applio) convierten la identidad del hablante, no la intensidad vocal, por lo que resuelven un problema distinto. La única referencia técnicamente próxima documentada es kNN-VC, cuyo vocoder HiFi-GAN reutiliza este modelo.

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vocal intensity conversion (vers-project) | Conversión de intensidad vocal (audio a audio) | 2,66 M en el convertidor (+ WavLM-Large y HiFi-GAN congelados) | no disponible | MIT | Pesos en HuggingFace; codigo y demos enlazados por el autor |
| kNN-VC (Baas et al., 2023) | Conversión de hablante (audio a audio) | no disponible | no disponible | MIT (según el autor de esta ficha) | Codigo en GitHub; vocoder reutilizado por este modelo |
| RVC / so-vits-svc | Conversión de hablante (audio a audio) | no disponible | no disponible | no disponible | Ampliamente distribuidos en la comunidad (topic de GitHub y espacios de HuggingFace) |

Los datos de parámetros, contexto y rendimiento de RVC y so-vits-svc no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Dominio de entrenamiento único: el convertidor se entrenó exclusivamente con AVID, de modo que la generalización a otros corpus, micrófonos, idiomas o condiciones acústicas no está documentada.
- Rango no validado fuera de 42,8 a 76,1 dB SPL: el autor advierte que las intensidades objetivo fuera de ese intervalo no fueron evaluadas, por lo que el comportamiento fuera de rango es desconocido.
- Sin métricas publicadas: no hay resultados objetivos ni subjetivos que permitan anticipar la calidad de la conversión, el error en dB alcanzado ni la preservación real de la identidad del hablante.
- Riesgo de artefactos de resíntesis: al depender de un vocoder HiFi-GAN, la salida puede presentar artefactos propios de la resíntesis neuronal; no hay información sobre este extremo en la documentación disponible.
- Dependencia de terceros: WavLM-Large y el vocoder de kNN-VC no se incluyen en el repositorio y deben descargarse en tiempo de ejecución, lo que añade una dependencia de red y de los repositorios originales.
- Tamaño del repositorio reportado como 0,0 GB en los metadatos de HuggingFace: conviene verificar que los pesos `model.safetensors` están efectivamente disponibles antes de integrar el modelo en cualquier flujo de trabajo.
- Estado de publicación: el artículo está enviado, no aceptado ni publicado, por lo que las cifras y conclusiones pueden cambiar tras la revisión por pares.
- Uso comercial: la licencia MIT lo permite, pero se heredan las condiciones de las licencias de WavLM-Large y de kNN-VC, que deben verificarse por separado; la información disponible indica MIT para kNN-VC.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni despliegue en servidores de inferencia tipo vLLM u Ollama.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo por hablante, género, edad o variedad lingüística.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vers-project/vocal-intensity-conversion
- Código fuente: https://github.com/vers-project/vocal-intensity-conversion
- Muestras de audio: https://vers-project.github.io/vocal-intensity-conversion/
- Dataset AVID (Aalto Vocal Intensity Database): https://doi.org/10.5281/zenodo.8331897
- Repositorio de kNN-VC (vocoder HiFi-GAN y WavLM-Large): https://github.com/bshall/knn-vc
- Lista curada de conversión de voz (contexto): https://github.com/JeffC0628/awesome-voice-conversion
- Temática de conversión de voz en GitHub (contexto): https://github.com/topics/voice-conversion
- Applio, suite de conversión de voz (contexto): https://applio.org/
- Ultimate RVC, espacio de HuggingFace (contexto): https://huggingface.co/spaces/JackismyShephard/ultimate-rvc
