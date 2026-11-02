# Yuletye/osint-telephone

## Resumen
OSINT Geolocator es una aplicación Android distribuida por el usuario Yuletye a través de Hugging Face, cuyo propósito es estimar dónde y cuándo se tomó una fotografía ejecutando todo el cálculo de forma local en el teléfono, sin enviar las imágenes a ningún servidor externo. El repositorio contiene tanto el binario instalable (`osint.apk`) como el directorio `modele/`, que alberga una versión comprimida a 8 bits de GeoCLIP junto con cabezas de clasificación afinadas.

El componente de aprendizaje subyacente es GeoCLIP (Vivanco et al., NeurIPS 2023), un modelo de geolocalización de imágenes construido sobre el codificador visual de CLIP ViT-L/14 (OpenAI). La propuesta resuelve el problema de la geolocalización a partir de píxeles sin depender de metadatos EXIF ni de servicios en la nube, lo que resulta relevante para escenarios de privacidad, trabajo de campo sin conectividad y análisis OSINT ligero en dispositivos móviles.

El artefacto se publica en formato ONNX, ocupa aproximadamente 0,8 GB en el repositorio y se distribuye bajo licencia MIT. No hay información publicada sobre el conjunto de datos de entrenamiento, los idiomas de la interfaz ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GeoCLIP sobre codificador visual CLIP ViT-L/14, con cabezas de clasificación afinadas; exportado a ONNX |
| Parametros totales | no disponible (ViT-L/14 de CLIP ronda los 428 M en el codificador visual, pero el autor no publica el recuento exacto del conjunto) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | pesos comprimidos a 8 bits según la model card; no se detalla el esquema exacto (probablemente cuantización dinámica ONNX) |
| Idiomas soportados | no disponible (la interfaz de la app parece en francés, pero no se documenta soporte multilingüe) |
| Licencia | MIT |
| Formato de pesos | ONNX (exportación para inferencia en Android); APK distribuido en `app/osint.apk` |

## Arquitectura y entrenamiento
GeoCLIP combina un codificador de imagen basado en CLIP ViT-L/14 con un mecanismo de alineamiento entre representaciones visuales y coordenadas geográficas, siguiendo el planteamiento de Vivanco et al. (NeurIPS 2023). En esta distribución concreta, el autor ha comprimido el modelo a 8 bits y ha añadido "cabezas afinadas" (fine-tuned heads) que se actualizan tras cada ciclo de entrenamiento, aunque no se especifica cuántos ni sobre qué datos.

No hay información pública sobre el volumen de tokens o imágenes empleadas en el afinamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (irrelevantes en un modelo de visión). La innovación práctica del artefacto es la ejecución completamente en dispositivo mediante ONNX, evitando el envío de fotografías a servidores externos.

## Capacidades
- Geolocalización de imágenes: estima la ubicación probable donde se tomó una fotografía a partir de su contenido visual.
- Inferencia local en Android: todo el cómputo se ejecuta en el teléfono, sin llamadas a APIs remotas.
- Procesamiento de metadatos temporales: la model card menciona "retrouver où et quand", por lo que la app combina la estimación visual con la información temporal disponible en la propia imagen.
- Funcionamiento sin conectividad: al no requerir red, es utilizable en entornos aislados o con requisitos estrictos de privacidad.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking".

## Casos de uso
- Análisis OSINT de imágenes: verificar la ubicación probable de una fotografía obtenida de fuentes abiertas sin subirla a servicios de terceros, preservando la cadena de custodia y la privacidad del analista.
- Periodismo de verificación: comprobar la geolocalización aproximada de material gráfico recibido de corresponsales en zonas sin cobertura, ejecutando el modelo íntegramente en el dispositivo.
- Trabajo de campo sin conectividad: investigadores que documentan hallazgos en áreas remotas pueden geolocalizar in situ las fotografías tomadas, sin depender de red ni de GPS.
- Peritaje forense preliminar: obtener una primera estimación de localización a partir de imágenes cuyo EXIF ha sido eliminado, como paso previo a un análisis más profundo.
- Auditoría de privacidad: comprobar qué grado de información geográfica puede extraerse de fotografías propias antes de publicarlas, usando el propio teléfono como entorno controlado.
- Formación y divulgación en OSINT: demostrar en talleres prácticos cómo funciona la geolocalización visual por IA sin infraestructura de servidores, gracias al APK autónomo y al modelo ONNX incluido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplicable en el sentido tradicional; el modelo se ejecuta en el SoC del teléfono.
- Almacenamiento: el repositorio completo ocupa 0,8 GB, por lo que se requiere al menos ese espacio libre en el dispositivo Android (más el APK).
- RAM: no disponible; un ViT-L/14 cuantizado a 8 bits suele requerir varios cientos de MB, pero el autor no publica cifras.
- GPU recomendadas: no aplicable; el despliegue objetivo es un SoC Android con aceleración ONNX Runtime (NNAPI, GPU o CPU según el dispositivo).
- ¿Cabe en GPU de consumo? El modelo es para móvil, no para escritorio; una GPU de consumo podría ejecutarlo vía ONNX Runtime, pero no es el escenario previsto ni está documentado.
- Opciones de despliegue: ONNX Runtime en Android a través del APK; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de visión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OSINT Geolocator (Yuletye) | GeoCLIP + CLIP ViT-L/14 8-bit | Geolocalización de imágenes en móvil | ONNX + APK Android | MIT | Hugging Face |
| GeoCLIP (Vivanco et al.) | CLIP ViT-L/14 | Geolocalización de imágenes | Pesos PyTorch | MIT | Repositorio oficial del paper |
| Im2GPS / Im2GPS3k (Vo et al.) | Redes CNN + recuperación | Geolocalización de imágenes | Pesos de referencia | no disponible | Repositorios académicos |
| PIGEON (Haas et al.) | CLIP + prior geográfico | Geolocalización de imágenes | Pesos PyTorch | no disponible | Repositorio del proyecto |

Los tres comparadores son modelos de referencia en geolocalización visual; OSINT Geolocator se distingue por su empaquetado como aplicación Android autónoma y por la cuantización a 8 bits, no por mejoras arquitectónicas propias.

## Limitaciones y advertencias
- Sesgos geográficos: los modelos de geolocalización visual suelen rendir mejor en regiones sobrerrepresentadas en los datos de entrenamiento (Norteamérica y Europa occidental), degradándose en zonas rurales o con menor cobertura fotográfica.
- Riesgo de alucinación geográfica: el modelo devuelve una estimación probabilística, no una certeza; puede producir localizaciones plausibles pero incorrectas, especialmente en imágenes sin señales visuales distintivas.
- Idiomas: no se documenta soporte multilingüe; la interfaz parece estar en francés y no se especifican otros idiomas.
- Licencia: MIT permite uso comercial, pero conviene verificar las condiciones de los componentes de terceros (GeoCLIP y CLIP, ambos MIT según la model card) y citar adecuadamente los trabajos originales.
- Uso responsable: la herramienta puede emplearse para vigilancia o identificación de personas; su uso debe respetar la normativa de protección de datos (RGPD) y los derechos de las personas retratadas.
- Madurez: el repositorio no tiene descargas ni valoraciones, no publica métricas de precisión y el autor lo describe como "application personnelle"; no hay garantía de mantenimiento ni de soporte.
- Fecha de creación anómala: la model card indica 2026-11-02, lo que puede reflejar un error de metadatos; conviene contrastar la integridad del artefacto antes de usarlo en producción.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Yuletye/osint-telephone
- APK Android: https://huggingface.co/Yuletye/osint-telephone/resolve/main/app/osint.apk
- Paper de GeoCLIP (Vivanco et al., NeurIPS 2023): https://arxiv.org/abs/2309.05164 (referencia citada en la model card)
- CLIP (OpenAI): https://github.com/openai/CLIP
- ONNX Runtime: https://onnxruntime.ai/
