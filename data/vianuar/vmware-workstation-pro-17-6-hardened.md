# Vianuar/vmware-workstation-pro-17-6-hardened

## Resumen

No es un modelo de IA. La entrada `Vianuar/vmware-workstation-pro-17-6-hardened` de Hugging Face no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje. Se trata de un repositorio que redistribuye un supuesto ejecutable para Windows (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB protegido con contraseña) presentado como "VMware Workstation Pro 17.6 hardened".

El contenido de la model card describe módulos de evasión de anti-cheat (EAC, BattlEye, Ricochet), enmascaramiento de números de serie NVMe/SATA, aleatorización de SMBIOS y UUID, limpieza de telemetría y manipulación de TPM 2.0. Es decir, funcionalidad típica de herramientas de trampas para videojuegos y de ocultación de máquinas virtuales, no capacidades de inferencia. El nombre del ejecutable hace referencia explícita a un *trainer* de Kingdom Come: Deliverance 2.

Por tanto, esta ficha no puede documentar parámetros, contexto, cuantizaciones ni benchmarks: no existen. El repositorio es relevante únicamente como caso de mal uso de Hugging Face para distribuir binarios opacos, y debe tratarse como potencialmente malicioso. No se recomienda su descarga ni ejecución en ningún entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no del modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de red neuronal, ni dataset de entrenamiento, ni proceso de alineación (RLHF/DPO), ni innovaciones de inferencia que documentar. El "artefacto" es un binario PE para Windows 10/11 de 64 bits, distribuido a través de un enlace a GitHub Releases y protegido con la contraseña `2026`, lo que impide cualquier inspección previa a la extracción.

La model card menciona componentes como "multi-anticheat isolation", "nvme & sata serial mask", "deep telemetry cleaner", "TPM 2.0 & 24H2 safe flow", "SMBIOS & UUID randomizer" y "1-click factory restore", con cifras de sondeo de 277 Hz y 330 Hz y latencias de 14-19 ms. Son afirmaciones de marketing sin verificación técnica posible y sin relación alguna con el aprendizaje automático.

## Capacidades

- Ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma del repositorio son metadatos de etiquetado.
- El binario declara funcionalidades de evasión de anti-cheat, spoofing de hardware y limpieza de rastros, sin evidencia independiente.

## Casos de uso

- Ninguno legítimo en el ámbito de la IA o del desarrollo de software.
- Uso declarado por el autor: ocultar una máquina virtual VMware a sistemas anti-cheat de videojuegos (EAC, BattlEye, Ricochet), lo que habitualmente infringe los términos de servicio de los juegos y puede conllevar el baneo de cuentas.
- Uso declarado: modificar identificadores de disco (NVMe/SATA) y SMBIOS/UUID para dificultar la correlación de hardware entre sesiones.
- Uso declarado: purgar telemetría, volcados de fallos y el diario USN de Windows, lo que puede destruir evidencia forense y complicar el soporte técnico.
- Uso declarado: manipulación de TPM 2.0 en Windows 11 24H2, con riesgo de dejar el sistema en un estado de arranque inconsistente.
- Escenario realista y desaconsejado: ejecutar el `.exe` como administrador en una máquina de trabajo, lo que otorga control total del sistema a un binario de procedencia no verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro tipo, porque no hay modelo que evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma objetivo declarada: Windows 10/11 de 64 bits.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card (14-19 ms, 277-330 Hz) no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" para un binario de este tipo. Como referencia de contraste, cualquier modelo de lenguaje real (por ejemplo, familias de 7B a 70B con licencias Apache 2.0 o MIT) publica pesos en safetensors/GGUF, tokenizador, configuración y evaluaciones reproducibles; este repositorio no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en comparativas, catálogos ni pipelines.
- Riesgo de seguridad alto: binario opaco, protegido con contraseña, distribuido fuera de canales oficiales de VMware y ejecutado con privilegios de administrador.
- Posible malware: la combinación de evasión de anti-cheat, spoofing de hardware y limpieza de telemetría es coherente tanto con herramientas de trampas como con cargas maliciosas.
- La licencia MIT declarada en los metadatos no garantiza nada sobre el binario ni sobre su legalidad en jurisdicciones concretas.
- El uso de herramientas de evasión de anti-cheat puede violar los términos de servicio de plataformas de juego y la legislación de protección de sistemas informáticos.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros ajenos al espacio de nombres del autor, lo que incrementa el riesgo de sustitución del artefacto.
- No hay trazabilidad de versiones, firma de código ni sumas de verificación publicadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vianuar/vmware-workstation-pro-17-6-hardened
- Release enlazada en la model card (GitHub, terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Releases del repositorio citado: https://github.com/FuxavaSuc63/vmware-workstation-pro-17-6-hardened/releases/latest
- Documentación oficial de VMware Workstation (referencia legítima del producto que el repositorio dice emular): https://techzone.vmware.com/
