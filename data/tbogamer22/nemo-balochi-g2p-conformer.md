# TBOGamer22/nemo-balochi-g2p-conformer

## Resumen

El modelo `TBOGamer22/nemo-balochi-g2p-conformer` es un sistema de conversión grafema a fonema (G2P) específico para el balochi pakistaní, desarrollado por Talha Bin Omar sobre el framework NVIDIA NeMo. Convierte texto en escritura perso-árabe en secuencias de fonemas IPA de tipo amplio, pensado como componente de preprocesamiento para síntesis de voz (TTS), etiquetado de pronunciación y control de calidad de corpus de habla. Se trata de la primera publicación pública de un modelo G2P dedicado al balochi, una lengua gravemente infrarrepresentada en tecnologías del habla.

Arquitectónicamente emplea un codificador Conformer de 8 capas con pérdida CTC a nivel de caracteres, con tamaño oculto de 192, 4 cabezas de atención y kernel de convolución de 15. El modelo es no autorregresivo, lo que lo hace significativamente más rápido en inferencia que alternativas basadas en transformadores como ByT5, según la documentación de NeMo. La licencia es MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (codificador de 8 capas, hidden size 192, 4 cabezas de atención, kernel de convolución 15) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 caracteres expandidos (cada carácter no espacio se repite 3 veces para alineación CTC) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bal (balochi pakistaní, escritura perso-árabe) |
| Licencia | MIT |
| Formato de pesos | NeMo (.nemo) con tokenizers embebidos; también se incluyen archivos de configuración y vocabularios |

## Arquitectura y entrenamiento

El modelo sigue el esquema G2P-Conformer CTC de NVIDIA NeMo: un codificador Conformer procesa la secuencia de caracteres de entrada y un decodificador lineal produce la distribución sobre los fonemas, optimizada con pérdida CTC. La entrada se expande repitiendo tres veces cada carácter no espaciado para facilitar la alineación, con un máximo de 1024 caracteres expandidos. La salida es una secuencia de fonemas IPA de tipo amplio, no una transcripción fonética estrecha.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El repositorio público contiene únicamente archivos de inferencia; no incluye datasets, manifiestos, tablas de predicción ni checkpoints de entrenamiento. Según la documentación de NeMo, este tipo de modelo tiene aproximadamente 20 veces menos parámetros que un ByT5 equivalente y es no autorregresivo, lo que lo hace más rápido en inferencia.

## Capacidades

- Conversión grafema a fonema (G2P) para balochi pakistaní en escritura perso-árabe, generando secuencias de fonemas IPA amplios.
- Preprocesamiento de texto para sistemas de síntesis de voz (TTS) en balochi.
- Etiquetado de pronunciación para inicializar léxicos o recursos lingüísticos.
- Control de calidad de corpus de habla: verificación de consistencia entre texto y pronunciación.
- Inferencia no autorregresiva, lo que permite procesamiento rápido de lotes de texto.
- Soporte para entrada de una sola frase o de archivos de texto con múltiples líneas (mediante el script `inference.py`).
- No incluye capacidades de tool calling, agentes, visión ni audio; es un modelo puramente de texto a fonemas.

## Casos de uso

- Preprocesamiento para síntesis de voz en balochi: el modelo convierte texto en secuencias IPA que pueden alimentar un frontend de TTS, reduciendo la necesidad de diccionarios de pronunciación manuales.
- Construcción de léxicos de pronunciación: a partir de listas de palabras o frases, se generan automáticamente transcripciones IPA amplias para crear recursos lingüísticos reutilizables.
- Control de calidad de corpus de habla: al comparar las transcripciones IPA predichas con las transcripciones existentes, se pueden detectar inconsistencias o errores en conjuntos de datos de entrenamiento de ASR o TTS.
- Etiquetado de datos para investigación lingüística: proporciona una primera aproximación fonética para estudios sobre dialectos balochi, aunque siempre requiere revisión humana.
- Desarrollo de herramientas educativas: puede integrarse en aplicaciones de aprendizaje de pronunciación del balochi, generando la forma fonética de palabras introducidas por el usuario.
- Integración en pipelines de procesamiento de lenguaje natural para lenguas de Pakistán: junto con los modelos G2P de pashto y sindhi de la misma familia, permite unificar el tratamiento de varias lenguas regionales en sistemas multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como precisión fonémica, WER ni comparaciones con otros sistemas G2P.

## Requisitos de hardware

- Al ser un modelo pequeño (8 capas, hidden size 192), es viable en CPU para inferencia por lotes pequeños.
- No se dispone de datos oficiales sobre VRAM, latencia o throughput.
- Se puede ejecutar en GPUs de consumo como una RTX 3060 o superiores, aunque no es necesario para tareas de baja carga.
- El despliegue se realiza mediante el script `inference.py` incluido en el repositorio, que carga el modelo NeMo localmente o desde Hugging Face.
- No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo NeMo, el flujo habitual es mediante la librería NeMo o el script proporcionado.

## Comparativa con modelos similares

No se dispone de información sobre modelos G2P comparables para balochi, ya que este es el primero público. En la familia de modelos G2P de NeMo existen alternativas para otros idiomas (por ejemplo, inglés, pashto, sindhi), pero no se han publicado comparativas cuantitativas entre ellos. La documentación de NeMo indica que los modelos G2P-Conformer tienen aproximadamente 20 veces menos parámetros que los basados en ByT5 y son no autorregresivos, lo que los hace más rápidos, pero no se aportan cifras concretas para este modelo.

## Limitaciones y advertencias

- El balochi presenta variación dialectal y ortográfica; una misma grafía puede tener más de una pronunciación válida, lo que limita la fiabilidad del modelo en casos ambiguos.
- La salida es una transcripción IPA amplia predicha por el modelo, no una transcripción fonética estrecha; no debe usarse como anotación lingüística definitiva sin revisión experta.
- El modelo puede fallar con code-switching, ortografías poco comunes, nombres extranjeros, texto con mucha puntuación o caracteres no vistos durante el entrenamiento.
- No sustituye la revisión por hablantes nativos de balochi o lingüistas entrenados.
- El repositorio no incluye datos de entrenamiento ni información sobre el corpus utilizado, lo que dificulta evaluar su cobertura y posibles sesgos.
- Aunque la licencia MIT permite uso comercial, el modelo es experimental y no se garantiza su precisión en entornos de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TBOGamer22/nemo-balochi-g2p-conformer)
- [Colección Pakistani Languages G2P Family](https://huggingface.co/collections/TBOGamer22/pakistani-languages-g2p-family-6a80b528dec2241021bed73e/pakistani-languages-g2p-family-6a80b528dec2241021bed73e)
- [Modelo Pashto Conformer G2P](https://huggingface.co/TBOGamer22/nemo-pashto-g2p-conformer)
- [Modelo Sindhi Conformer G2P](https://huggingface.co/TBOGamer22/nemo-sindhi-g2p-conformer)
- [Documentación de G2P en NeMo-Speech](https://docs.nvidia.com/nemo/speech/latest/tts/g2p.html)
- [Documentación de G2P en NVIDIA NeMo Framework](https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/tts/g2p.html)
- [Perfil del autor en Hugging Face](https://huggingface.co/TBOGamer22)
